'use client'
import React, { useRef, useEffect } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface VideoPlayerProps {
  src: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      const player = videojs(videoRef.current, {
        autoplay: false,
        controls: true,
        responsive: true,
        fluid: true,
      });

      player.src({
        src:"https://pub-f1d8461da6fd4a88ac4b27ebad4e1528.r2.dev/hls/a/master.m3u8",
        type: 'application/x-mpegURL',
      });

      player.on('loadedmetadata', () => {

      });

      return () => {
        player.dispose();
      };
    }
  }, [src]);

  return (
      <video
        ref={videoRef}
        className="video-js vjs-default-skin rounded"
        controls 
        />
  )
};

export default VideoPlayer;
