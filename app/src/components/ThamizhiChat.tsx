import React from 'react';
import { Capacitor } from '@capacitor/core';

const ThamizhiChat = () => {
  return (
    <div>
      <h1>Welcome to Thamizhi Chat</h1>
      <p>Start chatting now!</p>
      <p>Running on: {Capacitor.getPlatform()}</p>
    </div>
  );
};

export default ThamizhiChat;