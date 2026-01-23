import React, { useState, useRef, useEffect, Fragment } from "react";
import { useStore } from "@nanostores/react";

import randomstring from "randomstring";
import find from "lodash/find";
import toLower from "lodash/toLower";

import { useFormik } from "formik";
import * as Yup from "yup";
import bcrypt from "bcryptjs";

import {
  name,
  email,
  password1,
  password2,
  country,
  address,
  subscriptionType,
} from "../../form/methods/default-schema";

import NameInput from "../../form/fields/name-input";
import EmailInput from "../../form/fields/email-input";
import PasswordInput1 from "../../form/fields/password-input-1";
import PasswordInput2 from "../../form/fields/password-input-2";
import SubscriptionTypeRadio from "../../form/fields/subscription-type-radio";
// import CountryInput from '../../form/fields/country-input'
import CountryCombobox from "../../form/fields/country-combobox";
import AddressTextarea from "../../form/fields/address-textarea";
import SubmitButton from "../../form/submit-button";
import Tracker from "../../form/tracker";

import exists from "../../../methods/exists";
import getRandomArbitraryInt from "@/methods/get-random-arbitrary-int";

// import Toolbar from '../components/user-system-modal-header-toolbar'
// import Footer from '../components/user-system-modal-footer'
// import Pricing from '../components/pricing'
import TalamForm from "../components/talam-form";

import { subscriptions } from "../commons";

// ---- nanostores (no Redux) ----
import { $session } from "@/stores/session";
import { setDataBeforeNavigation } from "@/stores/user-system";

// ----------------------------- Helpers ---------------------------------
const validationSchema = Yup.object().shape({
  name,
  email,
  password1,
  password2,
  subscriptionType,
  country,
  address,
});

function fmtMonthYear(ts) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      month: "short",
      year: "numeric",
    }).format(ts);
  } catch {
    return "";
  }
}

function addYears(epochMs, years) {
  const d = new Date(epochMs);
  d.setFullYear(d.getFullYear() + years);
  return +d;
}

function todayEpoch() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return +d;
}

async function fetchJson(url, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
}

function encodeEmailForQuery(email) {
  return encodeURIComponent(
    String(email || "")
      .trim()
      .toLowerCase(),
  );
}

function priceFor(type) {
  const s = find(subscriptions, ["value", type]);
  return s ? s.price : 0;
}

// Poll the subscription-lookup endpoint until the new record appears
async function pollForSubscription({ random, signal, maxMs = 30000 }) {
  const start = Date.now();
  let delay = 900;
  while (Date.now() - start < maxMs) {
    const url = `https://subscription-read-interface.aurovilletoday.workers.dev/Subscriptions?view=Published&fields%5B%5D=Until+issue&fields%5B%5D=User+Record+ID&fields%5B%5D=Record+ID&filterByFormula=IF(Random%3D%27${encodeURIComponent(
      random,
    )}%27%2C+1%2C+0)`;
    try {
      const data = await fetchJson(url, signal);
      const recs = data?.records;
      if (recs && recs[0]) return recs[0];
    } catch {
      /* retry until timeout */
    }
    await new Promise((r) => setTimeout(r, delay));
    delay = Math.min(2000, Math.round(delay * 1.25));
  }
  throw new Error("Timed out waiting for subscription record");
}

// ----------------------------------------------------------------------------
// ------------------------------------------------------------------ Component
// ----------------------------------------------------------------------------
export default function SignupAndSubscribe() {
  const formEl = useRef(null);
  const abortRef = useRef(null);

  const session = useStore($session);
  const isLoggedIn = !!session;
  const userDataFromSession = session || null;

  const [talamData, setTalamData] = useState({ canProceed: false });
  const [state, setState] = useState({
    serverMessage: "Not yet initialized.",
    started: false,
    finished: false,
    finishedMessage: null,
    disableSubmit: false,
  });

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const form = useFormik({
    initialValues: {
      name: "",
      email: "",
      password1: "",
      password2: "",
      subscriptionType: "",
      country: "",
      address: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setState((s) => ({
        ...s,
        serverMessage: "Checking account…",
        started: true,
        finished: false,
        finishedMessage: null,
        disableSubmit: true,
      }));

      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      try {
        // 1) Check if subscriber exists
        const emailNorm = encodeEmailForQuery(values.email);
        const existsUrl = `https://avtoday-check-subscriber-exists.dbx834.workers.dev/?filterByFormula=IF(%7BEmail%7D%3D%22${emailNorm}%22%2C+1%2C+0)`;
        const existsData = await fetchJson(existsUrl, abortRef.current.signal);
        const already =
          Array.isArray(existsData?.records) && existsData.records.length > 0;

        if (already) {
          setState((s) => ({
            ...s,
            serverMessage: null,
            finished: true,
            finishedMessage:
              "An account with that email already exists in our records.",
          }));
          return;
        }

        // 2) Prepare user + linked subscription fields
        const now = todayEpoch();
        const ends = addYears(now, 1);
        const displayEnds = fmtMonthYear(ends);
        const paymentExpected = priceFor(values.subscriptionType);
        const countryIsIndia =
          values.subscriptionType === "India - print" ||
          values.subscriptionType === "India - digital";

        // bcryptjs async
        const encrypted = await new Promise((resolve, reject) =>
          bcrypt.hash(values.password1, 10, (err, hash) =>
            err ? reject(err) : resolve(hash),
          ),
        );

        const random = randomstring.generate();
        const lowerEmail = toLower(values.email);

        const airtableData = {
          fields: {
            Name: values.name,
            Email: lowerEmail,
            "Originally submitted email": values.email,
            hashed_password: encrypted,
            "Confirm Password Hash": now,
            "Created Through": "Website",
            "Created By": "User",
            Status: "To be confirmed",
            Linked: 1,
            "Linked Subscription Type": values.subscriptionType,
            "Linked Address": values.address,
            "Linked Country": countryIsIndia ? "India" : values.country,
            "Linked Subscription Starts X": now,
            "Linked Subscription Ends X": ends,
            "Linked Status": "Fixed duration",
            "Linked Created by": "User",
            "Linked Payment Status": "Talam transaction initiated",
            "Linked Payment expected": paymentExpected,
            "Linked Random": random,
          },
        };

        // 3) Create subscriber
        setState((s) => ({ ...s, serverMessage: "Adding subscriber…" }));
        await fetch(`https://avtoday-add-subscriber.dbx834.workers.dev/`, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(airtableData),
          signal: abortRef.current.signal,
        });

        // 4) Poll for subscription record to appear
        setState((s) => ({ ...s, serverMessage: "Preparing payment link…" }));
        const subscription = await pollForSubscription({
          random,
          signal: abortRef.current.signal,
          maxMs: getRandomArbitraryInt(8000, 14000),
        });

        const fields = subscription?.fields || {};
        const subscriptionRecordId = fields["Record ID"];
        const userRecordId = fields["User Record ID"]?.[0];
        const untilIssue = fields["Until issue"];

        const moneyReceived = paymentExpected;

        setTalamData({
          name: values.name,
          email: lowerEmail,
          return_url:
            values.name === "PK Local"
              ? `http://localhost:4321/?workflow=after-talam-transaction-confirm-new-subscription&subscriptionRecordId=${subscriptionRecordId}&paymentConfirmed=1&moneyReceived=${moneyReceived}&truncate=`
              : `https://auroville.today/?workflow=after-talam-transaction-confirm-new-subscription&subscriptionRecordId=${subscriptionRecordId}&paymentConfirmed=1&moneyReceived=${moneyReceived}&truncate=`,
          amount: lowerEmail === "misterpk@protonmail.com" ? 1 : moneyReceived,
          source_order_id: subscriptionRecordId,
          canProceed: true,
        });

        // 5) Stash data for the landing step after payment (Nanostore)
        const userData = {
          userId: userRecordId,
          userStatus: "Confirmed by user",
          userEmail: lowerEmail,
          userName: values.name,
          subscriptionId: subscriptionRecordId,
          subscriptionStatus: "Fixed duration",
          subscriptionType: values.subscriptionType,
          subscriptionStarts: now,
          subscriptionEnds: ends,
          subscriptionEndsDisplay: displayEnds,
          subscriptionUntilIssue: untilIssue,
          subscriptionCountry: countryIsIndia ? "India" : values.country,
          subscriptionAddress: values.address,
          subscriptionActive: true,
        };

        setDataBeforeNavigation({ userData });

        // UX countdown before we auto-submit Talam form
        setState((s) => ({
          ...s,
          serverMessage: "Redirecting to payment…",
          finished: true,
        }));
      } catch (err) {
        console.debug(err);
        setState((s) => ({
          ...s,
          serverMessage: "Error…",
          finished: true,
          finishedMessage:
            "The server is unreachable at the moment. Please try again in a few moments. If the issue persists please write to aurovilletodayweb@gmail.com",
        }));
      }
    },
  });

  const showAddressInput =
    form.values.subscriptionType === "India - print" ||
    form.values.subscriptionType === "International - print";

  const countryIsIndia =
    form.values.subscriptionType === "India - print" ||
    form.values.subscriptionType === "India - digital";

  // Auto-submit payment form shortly after talamData is ready
  useEffect(() => {
    if (talamData.canProceed && formEl.current) {
      const t = setTimeout(
        () => formEl.current.submit(),
        getRandomArbitraryInt(3000, 3100),
      );
      return () => clearTimeout(t);
    }
  }, [talamData.canProceed]);

  return (
    <Fragment>
      {!isLoggedIn && (
        <div>
          <p>
            Please complete this form to sign up and subscribe to Auroville
            Today. Your subscription will be active for one year.
          </p>

          <form
            onSubmit={form.handleSubmit}
            id="contact-form"
            className="x-form"
          >
            <NameInput form={form} />
            <EmailInput form={form} />
            <PasswordInput1 form={form} />
            <PasswordInput2 form={form} label="Repeat password" />
            <CountryCombobox form={form} />
            <SubscriptionTypeRadio form={form} />
            {showAddressInput && (
              <Fragment>
                <p style={{ marginBottom: "var(--p25)" }}>Delivery address:</p>
                <AddressTextarea form={form} />
              </Fragment>
            )}
          </form>

          <SubmitButton form={form} state={state} />
          <Tracker form={form} state={state} />
        </div>
      )}

      {isLoggedIn && userDataFromSession?.subscriptionId && (
        <p>You already have a subscription.</p>
      )}

      <TalamForm talamData={talamData} formEl={formEl} />
    </Fragment>
  );
}
