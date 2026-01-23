import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import ReactPlayer from "react-player";

import { pad, formatTime } from "@/lib/utils";

type Icons = {
  backBlack: string;
  forwardBlack: string;
  backWhite: string;
  forwardWhite: string;
  pauseWhiteTransparent: string;
  pauseBlackTransparent: string;
  playWhiteTransparent: string;
  playBlackTransparent: string;
  soundBlackTransparent: string;
  soundWhiteTransparent: string;
};

type Props = {
  audioUrl: string;
  promptText?: string | null;
  revealText?: string | null;
  dark?: boolean;
  isRevealed?: boolean;
  style?: React.CSSProperties;
  icons: Icons;
};

const Duration = ({
  className,
  seconds,
}: {
  className?: string;
  seconds?: number;
}) => {
  const invalid = seconds == null || Number.isNaN(seconds);
  return (
    <time dateTime={`P${Math.round(seconds ?? 0)}S`} className={className}>
      {invalid ? <span>&nbsp;</span> : <span>{formatTime(seconds!)}</span>}
    </time>
  );
};

/**
 * Replacement for redux global current URL:
 * - when a player starts playing, it broadcasts the URL
 * - all other instances pause themselves if the URL differs
 */
const CHANNEL = "audio-player:current-url";

function setGlobalCurrentUrl(url: string) {
  (window as any).__audioPlayerCurrentURL = url;
  window.dispatchEvent(new CustomEvent(CHANNEL, { detail: { url } }));
}

function getGlobalCurrentUrl(): string | null {
  return (window as any).__audioPlayerCurrentURL ?? null;
}

export default function AudioPlayer({
  promptText = null,
  revealText = null,
  dark = false,
  audioUrl,
  isRevealed = false,
  style = {},
  icons,
}: Props) {
  const playerRef = useRef<ReactPlayer | null>(null);

  const [reveal, setReveal] = useState<boolean>(isRevealed);

  const [state, setState] = useState({
    url: null as string | null,
    pip: false,
    playing: false,
    controls: false,
    light: false,
    volume: 0.8,
    muted: false,
    played: 0, // fraction 0..1
    loaded: 0, // fraction 0..1
    duration: 0, // seconds
    playbackRate: 1.0,
    loop: false,
    loadedSeconds: 0,
    playedSeconds: 0,
    seeking: false,
  });

  const totalSeconds = useMemo(() => {
    // More stable than loadedSeconds/loaded (which explodes when loaded is 0)
    return state.duration || 0;
  }, [state.duration]);

  const load = (url: string) => {
    setState((s) => ({
      ...s,
      url,
      played: 0,
      loaded: 0,
      loadedSeconds: 0,
      playedSeconds: 0,
      pip: false,
      playing: true,
      seeking: false,
    }));
  };

  const handleStart = () => {
    setGlobalCurrentUrl(audioUrl);
  };

  const handlePlay = () => {
    const current = getGlobalCurrentUrl();
    if (current !== audioUrl) setGlobalCurrentUrl(audioUrl);
    setState((s) => ({ ...s, playing: true }));
  };

  const handlePause = () => {
    setState((s) => ({ ...s, playing: false }));
  };

  const handlePlayPause = () => {
    // if you hit play on a paused instance, also claim the global URL
    const next = !state.playing;
    if (next) setGlobalCurrentUrl(audioUrl);
    setState((s) => ({ ...s, playing: next }));
  };

  const handleSeekMouseDown = () => {
    setState((s) => ({ ...s, seeking: true }));
  };

  const handleSeekChange = (value: number) => {
    setState((s) => ({ ...s, played: value, playing: true }));
  };

  const handleSeekMouseUp = (value: number) => {
    setState((s) => ({ ...s, seeking: false, playing: true }));
    playerRef.current?.seekTo(value, "fraction");
  };

  const handleProgress = (progress: any) => {
    setState((s) => (s.seeking ? s : { ...s, ...progress }));
  };

  const handleEnded = () => {
    setState((s) => ({ ...s, playing: s.loop }));
  };

  const handleDuration = (duration: number) => {
    setState((s) => ({ ...s, duration }));
  };

  const handleSeekBackward = (playedSeconds: number) => {
    playerRef.current?.seekTo(Math.max(0, playedSeconds - 10), "seconds");
  };

  const handleSeekForward = (playedSeconds: number) => {
    playerRef.current?.seekTo(playedSeconds + 10, "seconds");
  };

  // Listen for "another player started" events and pause if it's not us
  useEffect(() => {
    const onGlobal = (e: Event) => {
      const url = (e as CustomEvent).detail?.url as string | undefined;
      if (!url) return;
      if (url !== audioUrl) {
        setState((s) => ({ ...s, playing: false }));
      }
    };
    window.addEventListener(CHANNEL, onGlobal);
    return () => window.removeEventListener(CHANNEL, onGlobal);
  }, [audioUrl]);

  return (
    <div className="audio" style={{ ...style }}>
      {reveal === false ? (
        <div
          className="overlay"
          onClick={() => {
            setReveal(true);
            load(audioUrl);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setReveal(true);
              load(audioUrl);
            }
          }}
        >
          {!dark ? (
            <Fragment>
              <img
                loading="eager"
                className="icon"
                src={icons.soundWhiteTransparent}
                alt=""
              />
              <p className="alt">{promptText}</p>
            </Fragment>
          ) : (
            <Fragment>
              <img
                loading="eager"
                className="icon"
                src={icons.soundBlackTransparent}
                alt=""
              />
              <p>{promptText}</p>
            </Fragment>
          )}
        </div>
      ) : (
        <div className="audio-player">
          {revealText != null && (
            <Fragment>
              {!dark ? (
                <p className="alt m-b-1" style={{ maxWidth: "60%" }}>
                  {revealText}
                </p>
              ) : (
                <p className="m-b-1" style={{ maxWidth: "60%" }}>
                  {revealText}
                </p>
              )}
            </Fragment>
          )}

          <ReactPlayer
            ref={(r) => {
              // react-player uses a class instance; this is enough for seekTo
              playerRef.current = r;
            }}
            className="react-player"
            width="100%"
            height="100%"
            src={state.url ?? audioUrl}
            pip={state.pip}
            playing={state.playing}
            controls={state.controls}
            light={state.light}
            loop={state.loop}
            playbackRate={state.playbackRate}
            volume={state.volume}
            muted={state.muted}
            onStart={handleStart}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
            onProgress={handleProgress}
            onDurationChange={handleDuration}
          />

          <div className="time-bar">
            {!dark ? (
              <Duration seconds={state.playedSeconds} className="alt" />
            ) : (
              <Duration seconds={state.playedSeconds} />
            )}

            <input
              type="range"
              min={0}
              max={0.999999}
              step="any"
              value={state.played}
              onMouseDown={handleSeekMouseDown}
              onChange={(e) => handleSeekChange(parseFloat(e.target.value))}
              onMouseUp={(e) =>
                handleSeekMouseUp(parseFloat(e.currentTarget.value))
              }
              className={!dark ? "alt" : ""}
            />

            {!dark ? (
              <Duration seconds={totalSeconds} className="alt" />
            ) : (
              <Duration seconds={totalSeconds} />
            )}
          </div>

          <div className="control-bar">
            {state.playedSeconds != null &&
              !Number.isNaN(state.playedSeconds) && (
                <button
                  onClick={() => handleSeekBackward(state.playedSeconds)}
                  type="button"
                >
                  {!dark ? (
                    <img
                      loading="eager"
                      className="icon"
                      src={icons.backWhite}
                      alt="Back 10s"
                    />
                  ) : (
                    <img
                      loading="eager"
                      className="icon"
                      src={icons.backBlack}
                      alt="Back 10s"
                    />
                  )}
                </button>
              )}

            <button onClick={handlePlayPause} type="button">
              {state.playing ? (
                !dark ? (
                  <img
                    loading="eager"
                    className="icon"
                    src={icons.pauseWhiteTransparent}
                    alt="Pause"
                  />
                ) : (
                  <img
                    loading="eager"
                    className="icon"
                    src={icons.pauseBlackTransparent}
                    alt="Pause"
                  />
                )
              ) : !dark ? (
                <img
                  loading="eager"
                  className="icon"
                  src={icons.playWhiteTransparent}
                  alt="Play"
                />
              ) : (
                <img
                  loading="eager"
                  className="icon"
                  src={icons.playBlackTransparent}
                  alt="Play"
                />
              )}
            </button>

            {state.playedSeconds != null &&
              !Number.isNaN(state.playedSeconds) && (
                <button
                  onClick={() => handleSeekForward(state.playedSeconds)}
                  type="button"
                >
                  {!dark ? (
                    <img
                      loading="eager"
                      className="icon"
                      src={icons.forwardWhite}
                      alt="Forward 10s"
                    />
                  ) : (
                    <img
                      loading="eager"
                      className="icon"
                      src={icons.forwardBlack}
                      alt="Forward 10s"
                    />
                  )}
                </button>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
