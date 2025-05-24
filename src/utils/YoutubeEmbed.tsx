import React, { useEffect, useRef } from 'react';

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  onVideoProgress?: (percentage: number) => void;
  onVideoEnd?: () => void;
  className?: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({
  videoId,
  title = 'YouTube Video',
  onVideoProgress,
  onVideoEnd,
  className = ''
}) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Load the YouTube iframe API if it's not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = initializePlayer;
    } else {
      initializePlayer();
    }
    
    return () => {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
      }
    };
  }, [videoId]);
  
  const initializePlayer = () => {
    if (!containerRef.current) return;
    
    if (playerInstanceRef.current) {
      playerInstanceRef.current.destroy();
    }
    
    playerInstanceRef.current = new window.YT.Player(containerRef.current, {
      videoId,
      height: '100%',
      width: '100%',
      playerVars: {
        autoplay: 0,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });
  };
  
  const onPlayerReady = () => {
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
    }
    
    // Set up interval to track progress
    if (onVideoProgress) {
      progressIntervalRef.current = window.setInterval(() => {
        if (playerInstanceRef.current && playerInstanceRef.current.getPlayerState() === 1) {
          const currentTime = playerInstanceRef.current.getCurrentTime();
          const duration = playerInstanceRef.current.getDuration();
          const percentage = (currentTime / duration) * 100;
          onVideoProgress(percentage);
        }
      }, 2000);
    }
  };
  
  const onPlayerStateChange = (event: any) => {
    // YT.PlayerState.ENDED = 0
    if (event.data === 0 && onVideoEnd) {
      onVideoEnd();
    }
  };

  return (
    <div className={`relative pt-[56.25%] w-full overflow-hidden rounded-lg ${className}`}>
      <div ref={containerRef} className="absolute top-0 left-0 w-full h-full" />
    </div>
  );
};

export default YouTubeEmbed;