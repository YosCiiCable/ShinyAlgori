// STEP0
const specifyServer = `
process.env.HOST = process.argv[2] || "";

if (!process.env.HOST) {
  console.log("Host missed");
  process.exit();
}
`;

const isTestTool = `
const TEST_TOOL_HOST_PORT = "3000"; // 追加

process.env.HOST = process.argv[2] || "";

const isTestTool = process.env.HOST.includes(TEST_TOOL_HOST_PORT); // 追加

if (!process.env.HOST) {
  console.log("Host missed");
  process.exit();
} else {
  console.log(\`Host: \${process.env.HOST}\`);
}
`;

const specifyDealer = `
const TEST_TOOL_HOST_PORT = "3000";

process.env.HOST = process.argv[2] || "";
process.env.DEALER = process.argv[3] || ""; // 追加

const isTestTool = process.env.HOST.includes(TEST_TOOL_HOST_PORT);
const roomName = process.env.DEALER; // 追加

if (!process.env.HOST) {
  console.log("Host missed");
  process.exit();
} else {
  console.log(\`Host: \${process.env.HOST}\`);
}

/** 追加 ここから */
if (!roomName) {
  console.log("Arguments invalid");
  if (!isTestTool) {
    process.exit();
  }
} else {
  console.log(\`Dealer: \${roomName}\`);
}
/** 追加 ここまで */
`;

const specifyPlayer = `
const TEST_TOOL_HOST_PORT = "3000";

process.env.HOST = process.argv[2] || "";
process.env.DEALER = process.argv[3] || "";
process.env.PLAYER = process.argv[4] || ""; // 追加

const isTestTool = process.env.HOST.includes(TEST_TOOL_HOST_PORT);
const roomName = process.env.DEALER;
const player = process.env.PLAYER; // 追加

if (!process.env.HOST) {
  console.log("Host missed");
  process.exit();
} else {
  console.log(\`Host: \${process.env.HOST}\`);
}

if (!roomName || !player) { // 変更
  console.log("Arguments invalid");
  if (!isTestTool) {
    process.exit();
  }
} else {
  console.log(\`Dealer: \${roomName}, Player: \${player}\`); // 変更
}
`;

const importSocketModule = `
const socketIoClient = require("socket.io-client"); // 追加

const TEST_TOOL_HOST_PORT = "3000";

process.env.HOST = process.argv[2] || "";
process.env.DEALER = process.argv[3] || "";
process.env.PLAYER = process.argv[4] || "";

const isTestTool = process.env.HOST.includes(TEST_TOOL_HOST_PORT);
const roomName = process.env.DEALER;
const player = process.env.PLAYER;

if (!process.env.HOST) {
  console.log("Host missed");
  process.exit();
} else {
  console.log(\`Host: \${process.env.HOST}\`);
}

if (!roomName || !player) {
  console.log("Arguments invalid");
  if (!isTestTool) {
    process.exit();
  }
} else {
  console.log(\`Dealer: \${roomName}, Player: \${player}\`);
}

/** 追加 ここから */
const client = socketIoClient.connect(process.env.HOST, {
  transports: ["websocket"],
});

client.on("connect", () => {
  console.log("Client connect successfully!");
});

client.on("disconnect", (dataRes) => {
  console.log("Client disconnect:");
  console.log(dataRes);
});
/** 追加 ここまで */
`;

// STEP1
const specifyEventName = `
const socketIoClient = require("socket.io-client");

const TEST_TOOL_HOST_PORT = "3000";
/** 追加 */
const SocketConst = {
  EMIT: {
    JOIN_ROOM: "join-room"
  }
};

process.env.HOST = process.argv[2] || "";
process.env.DEALER = process.argv[3] || "";
process.env.PLAYER = process.argv[4] || "";

const isTestTool = process.env.HOST.includes(TEST_TOOL_HOST_PORT);
const roomName = process.env.DEALER;
const player = process.env.PLAYER;
const eventName = process.argv[5]; // 追加

if (!process.env.HOST) {
  console.log("Host missed");
  process.exit();
} else {
  console.log(\`Host: \${process.env.HOST}\`);
}

if (!roomName || !player) {
  console.log("Arguments invalid");
  if (!isTestTool) {
    process.exit();
  }
} else {
  console.log(\`Dealer: \${roomName}, Player: \${player}\`);
}

const client = socketIoClient.connect(process.env.HOST, {
  transports: ["websocket"],
});

client.on("connect", () => {
  console.log("Client connect successfully!");
});

client.on("disconnect", (dataRes) => {
  console.log("Client disconnect:");
  console.log(dataRes);
});

/** 追加 ここから */
if (isTestTool) {
  if (eventName === SocketConst.EMIT.JOIN_ROOM) {
    // join-room送信イベント
  } else {
    console.log("No event name");
  }
} else {
  // join-room送信イベント
}
/** 追加 ここまで */
`;

const createSendDataFunction = `
const socketIoClient = require("socket.io-client");

const TEST_TOOL_HOST_PORT = "3000";
const SocketConst = {
  EMIT: {
    JOIN_ROOM: "join-room"
  }
};

process.env.HOST = process.argv[2] || "";
process.env.DEALER = process.argv[3] || "";
process.env.PLAYER = process.argv[4] || "";

const isTestTool = process.env.HOST.includes(TEST_TOOL_HOST_PORT);
const roomName = process.env.DEALER;
const player = process.env.PLAYER;
const eventName = process.argv[5];

if (!process.env.HOST) {
  console.log("Host missed");
  process.exit();
} else {
  console.log(\`Host: \${process.env.HOST}\`);
}

if (!roomName || !player) {
  console.log("Arguments invalid");
  if (!isTestTool) {
    process.exit();
  }
} else {
  console.log(\`Dealer: \${roomName}, Player: \${player}\`);
}

const client = socketIoClient.connect(process.env.HOST, {
  transports: ["websocket"],
});

client.on("connect", () => {
  console.log("Client connect successfully!");
});

client.on("disconnect", (dataRes) => {
  console.log("Client disconnect:");
  console.log(dataRes);
});

/** 追加 ここから */
function sendJoinRoom() {
  const data = {
    room_name: roomName,
    player: player
  };

  console.log(\`Send \${SocketConst.EMIT.JOIN_ROOM} event.\`)
  client.emit(SocketConst.EMIT.JOIN_ROOM, data, (err, res) => {
    if (err) {
      console.log(\`Client \${SocketConst.EMIT.JOIN_ROOM} failed!\`);
      console.error(err);
      return;
    } else {
      console.log(\`Client \${SocketConst.EMIT.JOIN_ROOM} successfully!\`);
      console.log(res);
    }
  });
}
/** 追加 ここまで */

if (isTestTool) {
  if (eventName === SocketConst.EMIT.JOIN_ROOM) {
    sendJoinRoom(); // 変更
  } else {
    console.log("No event name");
  }
} else {
  sendJoinRoom(); // 変更
}
`;

// STEP2
const createReceiveDataFunction = `
const socketIoClient = require("socket.io-client");

const TEST_TOOL_HOST_PORT = "3000";
const SocketConst = {
  EMIT: {
    JOIN_ROOM: "join-room"
    // （中略）各イベント名マップ
  }
};

process.env.HOST = process.argv[2] || "";
process.env.DEALER = process.argv[3] || "";
process.env.PLAYER = process.argv[4] || "";

const isTestTool = process.env.HOST.includes(TEST_TOOL_HOST_PORT);
const roomName = process.env.DEALER;
const player = process.env.PLAYER;
const eventName = process.argv[5];

if (!process.env.HOST) {
  console.log("Host missed");
  process.exit();
} else {
  console.log(\`Host: \${process.env.HOST}\`);
}

if (!roomName || !player) {
  console.log("Arguments invalid");
  if (!isTestTool) {
    process.exit();
  }
} else {
  console.log(\`Dealer: \${roomName}, Player: \${player}\`);
}

const client = socketIoClient.connect(process.env.HOST, {
  transports: ["websocket"],
});

client.on("connect", () => {
  console.log("Client connect successfully!");
});

client.on("disconnect", (dataRes) => {
  console.log("Client disconnect:");
  console.log(dataRes);
});

/** 追加 ここから */
client.on(SocketConst.EMIT.JOIN_ROOM, (dataRes) => {
  console.log(\`\${SocketConst.EMIT.JOIN_ROOM} : dataRes:\`, dataRes);
});
/** 追加 ここまで */

function sendJoinRoom() {
  const data = {
    room_name: roomName,
    player: player
  };

  console.log(\`Send \${SocketConst.EMIT.JOIN_ROOM} event.\`)
  client.emit(SocketConst.EMIT.JOIN_ROOM, data, (err, res) => {
    if (err) {
      console.log(\`Client \${SocketConst.EMIT.JOIN_ROOM} failed!\`);
      console.error(err);
      return;
    } else {
      console.log(\`Client \${SocketConst.EMIT.JOIN_ROOM} successfully!\`);
      console.log(res);
    }
  });
}

// （中略）各イベントの送信関数

if (isTestTool) {
  if (eventName === SocketConst.EMIT.JOIN_ROOM) {
    sendJoinRoom();
    // （中略）各イベントのテスト実行判定
  } else {
    console.log("No event name");
  }
} else {
  sendJoinRoom();
}
`;

// STEP3
const manageIdAndCards = `
const socketIoClient = require("socket.io-client");

const TEST_TOOL_HOST_PORT = "3000";
const SocketConst = {
  EMIT: {
    JOIN_ROOM: "join-room"
    // （中略）各イベント名マップ
  }
};

process.env.HOST = process.argv[2] || "";
process.env.DEALER = process.argv[3] || "";
process.env.PLAYER = process.argv[4] || "";

const isTestTool = process.env.HOST.includes(TEST_TOOL_HOST_PORT);
const roomName = process.env.DEALER;
const player = process.env.PLAYER;
const eventName = process.argv[5];

let id = ""; // 追加 自分のID
let globalCards = []; // 追加 自分の手札

if (!process.env.HOST) {
  console.log("Host missed");
  process.exit();
} else {
  console.log(\`Host: \${process.env.HOST}\`);
}

if (!roomName || !player) {
  console.log("Arguments invalid");
  if (!isTestTool) {
    process.exit();
  }
} else {
  console.log(\`Dealer: \${roomName}, Player: \${player}\`);
}

const client = socketIoClient.connect(process.env.HOST, {
  transports: ["websocket"],
});

client.on("connect", () => {
  console.log("Client connect successfully!");
});

client.on("disconnect", (dataRes) => {
  console.log("Client disconnect:");
  console.log(dataRes);
});

client.on(SocketConst.EMIT.JOIN_ROOM, (dataRes) => {
  console.log(\`\${SocketConst.EMIT.JOIN_ROOM} : dataRes:\`, dataRes);
});


/** 前STEPで実装済み ここから */
client.on(SocketConst.EMIT.NEXT_PLAYER, (dataRes) => {
  console.log(\`\${SocketConst.EMIT.NEXT_PLAYER} : dataRes:\`, dataRes);

  /** 追加 ここから */
  globalCards = dataRes.card_of_player;
  console.log(\`update globalCards: \${JSON.stringify(globalCards)}\`);
  /** 追加 ここまで */
});
/** 前STEPで実装済み ここまで */

// （中略）各イベントの受信機能

function sendJoinRoom() {
  const data = {
    room_name: roomName,
    player: player
  };

  console.log(\`Send \${SocketConst.EMIT.JOIN_ROOM} event.\`)
  client.emit(SocketConst.EMIT.JOIN_ROOM, data, (err, res) => {
    if (err) {
      console.log(\`Client \${SocketConst.EMIT.JOIN_ROOM} failed!\`);
      console.error(err);
      return;
    } else {
      console.log(\`Client \${SocketConst.EMIT.JOIN_ROOM} successfully!\`);
      console.log(res);
      id = res.your_id; // 追加
    }
  });
}

// （中略）各イベントの送信関数

if (isTestTool) {
  if (eventName === SocketConst.EMIT.JOIN_ROOM) {
    sendJoinRoom();
    // （中略）各イベントのテスト実行判定
  } else {
    console.log("No event name");
  }
} else {
  sendJoinRoom();
}
`;

const createCardSelectingFunction = `
const socketIoClient = require("socket.io-client");

const TEST_TOOL_HOST_PORT = "3000";
const SocketConst = {
  EMIT: {
    JOIN_ROOM: "join-room"
    // （中略）各イベント名マップ
  }
};

process.env.HOST = process.argv[2] || "";
process.env.DEALER = process.argv[3] || "";
process.env.PLAYER = process.argv[4] || "";

const isTestTool = process.env.HOST.includes(TEST_TOOL_HOST_PORT);
const roomName = process.env.DEALER;
const player = process.env.PLAYER;
const eventName = process.argv[5];

let id = ""; // 自分のID
let globalCards = []; // 自分の手札

if (!process.env.HOST) {
  console.log("Host missed");
  process.exit();
} else {
  console.log(\`Host: \${process.env.HOST}\`);
}

if (!roomName || !player) {
  console.log("Arguments invalid");
  if (!isTestTool) {
    process.exit();
  }
} else {
  console.log(\`Dealer: \${roomName}, Player: \${player}\`);
}

const client = socketIoClient.connect(process.env.HOST, {
  transports: ["websocket"],
});

client.on("connect", () => {
  console.log("Client connect successfully!");
});

client.on("disconnect", (dataRes) => {
  console.log("Client disconnect:");
  console.log(dataRes);
});

client.on(SocketConst.EMIT.JOIN_ROOM, (dataRes) => {
  console.log(\`\${SocketConst.EMIT.JOIN_ROOM} : dataRes:\`, dataRes);
});

client.on(SocketConst.EMIT.NEXT_PLAYER, (dataRes) => {
  console.log(\`\${SocketConst.EMIT.NEXT_PLAYER} : dataRes:\`, dataRes);

  globalCards = dataRes.card_of_player;
  console.log(\`update globalCards: \${JSON.stringify(globalCards)}\`);

  /** 追加 ここから */
  const playCard = selectPlayCard(dataRes.card_before);
  console.log(\`selected card: \${JSON.stringify(playCard)}\`);

  // TODO 残り手札数を考慮してUNOコールを宣言する必要があります。
  sendPlayCard(playCard);
  /** 追加 ここまで */
});

// （中略）各イベントの受信機能

/** 追加 ここから */
function selectPlayCard(beforeCard) {
  // カードを選択する実装を自身で自由に記述してください。
}
/** 追加 ここまで */

function sendJoinRoom() {
  const data = {
    room_name: roomName,
    player: player
  };

  console.log(\`Send \${SocketConst.EMIT.JOIN_ROOM} event.\`)
  client.emit(SocketConst.EMIT.JOIN_ROOM, data, (err, res) => {
    if (err) {
      console.log(\`Client \${SocketConst.EMIT.JOIN_ROOM} failed!\`);
      console.error(err);
      return;
    } else {
      console.log(\`Client \${SocketConst.EMIT.JOIN_ROOM} successfully!\`);
      console.log(res);
      id = res.your_id;
    }
  });
}

/** 前STEPで実装済み ここから */
function sendPlayCard(card) {
  const data = {
    card_play: card
  };

  client.emit(SocketConst.EMIT.PLAY_CARD, data, (err, res) => {
    if (err) {
      console.log(\`Client \${SocketConst.EMIT.PLAY_CARD} failed!\`);
      console.error(err);
      return;
    } else {
      console.log(\`Client \${SocketConst.EMIT.PLAY_CARD} successfully!\`);
      console.log(res);
    }
  });
}
/** 前STEPで実装済み ここまで */

// （中略）各イベントの送信関数

if (isTestTool) {
  if (eventName === SocketConst.EMIT.JOIN_ROOM) {
    sendJoinRoom();
    // （中略）各イベントのテスト実行判定
  } else {
    console.log("No event name");
  }
} else {
  sendJoinRoom();
}
`;

const executeCardSelectingFunction = `
const socketIoClient = require("socket.io-client");

const TEST_TOOL_HOST_PORT = "3000";
const SocketConst = {
  EMIT: {
    JOIN_ROOM: "join-room"
    // （中略）各イベント名マップ
  }
};

process.env.HOST = process.argv[2] || "";
process.env.DEALER = process.argv[3] || "";
process.env.PLAYER = process.argv[4] || "";

const isTestTool = process.env.HOST.includes(TEST_TOOL_HOST_PORT);
const roomName = process.env.DEALER;
const player = process.env.PLAYER;
const eventName = process.argv[5];

let id = ""; // 自分のID
let globalCards = []; // 自分の手札

if (!process.env.HOST) {
  console.log("Host missed");
  process.exit();
} else {
  console.log(\`Host: \${process.env.HOST}\`);
}

if (!roomName || !player) {
  console.log("Arguments invalid");
  if (!isTestTool) {
    process.exit();
  }
} else {
  console.log(\`Dealer: \${roomName}, Player: \${player}\`);
}

const client = socketIoClient.connect(process.env.HOST, {
  transports: ["websocket"],
});

client.on("connect", () => {
  console.log("Client connect successfully!");
});

client.on("disconnect", (dataRes) => {
  console.log("Client disconnect:");
  console.log(dataRes);
});

client.on(SocketConst.EMIT.JOIN_ROOM, (dataRes) => {
  console.log(\`\${SocketConst.EMIT.JOIN_ROOM} : dataRes:\`, dataRes);
});


client.on(SocketConst.EMIT.NEXT_PLAYER, (dataRes) => {
  console.log(\`\${SocketConst.EMIT.NEXT_PLAYER} : dataRes:\`, dataRes);

  globalCards = dataRes.card_of_player;
  console.log(\`update globalCards: \${JSON.stringify(globalCards)}\`);

  /** 追加 ここから */
  if (dataRes.must_call_draw_card) {
    sendDrawCard();
    return;
  }
  /** 追加 ここまで */

  const playCard = selectPlayCard(dataRes.card_before);
  console.log(\`selected card: \${JSON.stringify(playCard)}\`);

  if (playCard) { // 追加
    // TODO 残り手札数を考慮してUNOコールを宣言する必要があります。
    sendPlayCard(playCard);
  } else {
    // 選出したカードが無かった時
    sendDrawCard(); // 追加
  }
});

/** 前STEPで実装済み ここから */
client.on(SocketConst.EMIT.DRAW_CARD, (dataRes) => {
  console.log(\`\${SocketConst.EMIT.DRAW_CARD} : dataRes:\`, dataRes);

  /** 追加 ここから */
  if (dataRes.player !== id) {
    // 他のプレイヤーがカードを引いた時の通知は処理をしない
    return;
  }

  if (dataRes.can_play_draw_card) {
    // 引いたカードが場に出せるときはカードを出すか出さないかを選択する
    sendPlayDrawCard(true); // TODO 後で引数を決定する処理を追加する
    return;
  }
  /** 追加 ここまで */
});
/** 前STEPで実装済み ここまで */

// （中略）各イベントの受信機能

function selectPlayCard(beforeCard) {
  // カードを選択する実装を自身で自由に記述してください。
}

function sendJoinRoom() {
  const data = {
    room_name: roomName,
    player: player
  };

  console.log(\`Send \${SocketConst.EMIT.JOIN_ROOM} event.\`)
  client.emit(SocketConst.EMIT.JOIN_ROOM, data, (err, res) => {
    if (err) {
      console.log(\`Client \${SocketConst.EMIT.JOIN_ROOM} failed!\`);
      console.error(err);
      return;
    } else {
      console.log(\`Client \${SocketConst.EMIT.JOIN_ROOM} successfully!\`);
      console.log(res);
      id = res.your_id;
    }
  });
}

function sendPlayCard(card) {
  const data = {
    card_play: card
  };

  client.emit(SocketConst.EMIT.PLAY_CARD, data, (err, res) => {
    if (err) {
      console.log(\`Client \${SocketConst.EMIT.PLAY_CARD} failed!\`);
      console.error(err);
      return;
    } else {
      console.log(\`Client \${SocketConst.EMIT.PLAY_CARD} successfully!\`);
      console.log(res);
    }
  });
}

/** 前STEPで実装済み ここから */
function sendDrawCard() {
  const data = {};

  client.emit(SocketConst.EMIT.DRAW_CARD, data, (err, res) => {
    if (err) {
      console.log(\`Client \${SocketConst.EMIT.DRAW_CARD} failed!\`);
      console.error(err);
      return;
    } else {
      console.log(\`Client \${SocketConst.EMIT.DRAW_CARD} successfully!\`);
      console.log(res);
    }
  });
}

function sendPlayDrawCard(isPlayCard) {
  const data = {
    is_play_card: isPlayCard,
  };

  client.emit(SocketConst.EMIT.PLAY_DRAW_CARD, data, (err, res) => {
    if (err) {
      console.log(\`Client \${SocketConst.EMIT.PLAY_DRAW_CARD} failed!\`);
      console.error(err);
      return;
    } else {
      console.log(\`Client \${SocketConst.EMIT.PLAY_DRAW_CARD} successfully!\`);
      console.log(res);
    }
  });
}
/** 前STEPで実装済み ここまで */

// （中略）各イベントの送信関数

if (isTestTool) {
  if (eventName === SocketConst.EMIT.JOIN_ROOM) {
    sendJoinRoom();
    // （中略）各イベントのテスト実行判定
  } else {
    console.log("No event name");
  }
} else {
  sendJoinRoom();
}
`;

const createChangeColorFunction = `
const socketIoClient = require("socket.io-client");

const TEST_TOOL_HOST_PORT = "3000";
const SocketConst = {
  EMIT: {
    JOIN_ROOM: "join-room"
    // （中略）各イベント名マップ
  }
};

process.env.HOST = process.argv[2] || "";
process.env.DEALER = process.argv[3] || "";
process.env.PLAYER = process.argv[4] || "";

const isTestTool = process.env.HOST.includes(TEST_TOOL_HOST_PORT);
const roomName = process.env.DEALER;
const player = process.env.PLAYER;
const eventName = process.argv[5];

let id = ""; // 自分のID
let globalCards = []; // 自分の手札

if (!process.env.HOST) {
  console.log("Host missed");
  process.exit();
} else {
  console.log(\`Host: \${process.env.HOST}\`);
}

if (!roomName || !player) {
  console.log("Arguments invalid");
  if (!isTestTool) {
    process.exit();
  }
} else {
  console.log(\`Dealer: \${roomName}, Player: \${player}\`);
}

const client = socketIoClient.connect(process.env.HOST, {
  transports: ["websocket"],
});

client.on("connect", () => {
  console.log("Client connect successfully!");
});

client.on("disconnect", (dataRes) => {
  console.log("Client disconnect:");
  console.log(dataRes);
});

client.on(SocketConst.EMIT.JOIN_ROOM, (dataRes) => {
  console.log(\`\${SocketConst.EMIT.JOIN_ROOM} : dataRes:\`, dataRes);
});

/** 前STEPで実装済み ここから */
client.on(SocketConst.EMIT.COLOR_OF_WILD, (dataRes) => {
  console.log(\`\${SocketConst.EMIT.COLOR_OF_WILD} : dataRes:\`, dataRes);

  /** 追加 ここから */
  const color = selectChangeColor();
  sendColorOfWild(color);
  /** 追加 ここまで */
});
/** 前STEPで実装済み ここまで */

client.on(SocketConst.EMIT.NEXT_PLAYER, (dataRes) => {
  console.log(\`\${SocketConst.EMIT.NEXT_PLAYER} : dataRes:\`, dataRes);

  globalCards = dataRes.card_of_player;
  console.log(\`update globalCards: \${JSON.stringify(globalCards)}\`);

  if (dataRes.must_call_draw_card) {
    sendDrawCard();
    return;
  }

  const playCard = selectPlayCard(dataRes.card_before);
  console.log(\`selected card: \${JSON.stringify(playCard)}\`);

  if (playCard) {
    // TODO 残り手札数を考慮してUNOコールを宣言する必要があります。
    sendPlayCard(playCard);
  } else {
    // 選出したカードが無かった時
    sendDrawCard();
  }
});

client.on(SocketConst.EMIT.DRAW_CARD, (dataRes) => {
  console.log(\`\${SocketConst.EMIT.DRAW_CARD} : dataRes:\`, dataRes);

  if (dataRes.player !== id) {
    // 他のプレイヤーがカードを引いた時の通知は処理をしない
    return;
  }

  if (dataRes.can_play_draw_card) {
    // 引いたカードが場に出せるときはカードを出すか出さないかを選択する
    sendPlayDrawCard(true); // TODO 後で引数を決定する処理を追加する
    return;
  }
});

// （中略）各イベントの受信機能

function selectPlayCard(beforeCard) {
  // カードを選択する実装を自身で自由に記述してください。
}

/** 追加 ここから */
function selectChangeColor() {
  // 変更する色を判定する実装を自身で自由に記述してください。
}
/** 追加 ここまで */

function sendJoinRoom() {
  const data = {
    room_name: roomName,
    player: player
  };

  console.log(\`Send \${SocketConst.EMIT.JOIN_ROOM} event.\`)
  client.emit(SocketConst.EMIT.JOIN_ROOM, data, (err, res) => {
    if (err) {
      console.log(\`Client \${SocketConst.EMIT.JOIN_ROOM} failed!\`);
      console.error(err);
      return;
    } else {
      console.log(\`Client \${SocketConst.EMIT.JOIN_ROOM} successfully!\`);
      console.log(res);
      id = res.your_id;
    }
  });
}

/** 前STEPで実装済み ここから */
function sendColorOfWild(color) {
  const data = {
    color_of_wild: color
  };

  console.log(\`Send \${SocketConst.EMIT.COLOR_OF_WILD} event.\`)
  client.emit(SocketConst.EMIT.COLOR_OF_WILD, data, (err, res) => {
    if (err) {
      console.log(\`Client \${SocketConst.EMIT.COLOR_OF_WILD} failed!\`);
      console.error(err);
      return;
    } else {
      console.log(\`Client \${SocketConst.EMIT.COLOR_OF_WILD} successfully!\`);
      console.log(res);
    }
  });
}
/** 前STEPで実装済み ここまで */

function sendPlayCard(card) {
  const data = {
    card_play: card
  };

  client.emit(SocketConst.EMIT.PLAY_CARD, data, (err, res) => {
    if (err) {
      console.log(\`Client \${SocketConst.EMIT.PLAY_CARD} failed!\`);
      console.error(err);
      return;
    } else {
      console.log(\`Client \${SocketConst.EMIT.PLAY_CARD} successfully!\`);
      console.log(res);
    }
  });
}

function sendDrawCard() {
  const data = {};

  client.emit(SocketConst.EMIT.DRAW_CARD, data, (err, res) => {
    if (err) {
      console.log(\`Client \${SocketConst.EMIT.DRAW_CARD} failed!\`);
      console.error(err);
      return;
    } else {
      console.log(\`Client \${SocketConst.EMIT.DRAW_CARD} successfully!\`);
      console.log(res);
    }
  });
}

function sendPlayDrawCard(isPlayCard) {
  const data = {
    is_play_card: isPlayCard,
  };

  client.emit(SocketConst.EMIT.PLAY_DRAW_CARD, data, (err, res) => {
    if (err) {
      console.log(\`Client \${SocketConst.EMIT.PLAY_DRAW_CARD} failed!\`);
      console.error(err);
      return;
    } else {
      console.log(\`Client \${SocketConst.EMIT.PLAY_DRAW_CARD} successfully!\`);
      console.log(res);
    }
  });
}

// （中略）各イベントの送信関数

if (isTestTool) {
  if (eventName === SocketConst.EMIT.JOIN_ROOM) {
    sendJoinRoom();
    // （中略）各イベントのテスト実行判定
  } else {
    console.log("No event name");
  }
} else {
  sendJoinRoom();
}
`;

const createChallengeFunction = `
const socketIoClient = require("socket.io-client");

const TEST_TOOL_HOST_PORT = "3000";
const SocketConst = {
  EMIT: {
    JOIN_ROOM: "join-room"
    // （中略）各イベント名マップ
  }
};

process.env.HOST = process.argv[2] || "";
process.env.DEALER = process.argv[3] || "";
process.env.PLAYER = process.argv[4] || "";

const isTestTool = process.env.HOST.includes(TEST_TOOL_HOST_PORT);
const roomName = process.env.DEALER;
const player = process.env.PLAYER;
const eventName = process.argv[5];

/** 追加 ここから */
const DrawReason = {
  DRAW_2: "draw_2",
  WILD_DRAW_4: "wild_draw_4",
  BIND_2: "bind_2",
  NOTHING: "nothing"
};
/** 追加 ここまで */

let id = ""; // 自分のID
let globalCards = []; // 自分の手札

if (!process.env.HOST) {
  console.log("Host missed");
  process.exit();
} else {
  console.log(\`Host: \${process.env.HOST}\`);
}

if (!roomName || !player) {
  console.log("Arguments invalid");
  if (!isTestTool) {
    process.exit();
  }
} else {
  console.log(\`Dealer: \${roomName}, Player: \${player}\`);
}

const client = socketIoClient.connect(process.env.HOST, {
  transports: ["websocket"],
});

client.on("connect", () => {
  console.log("Client connect successfully!");
});

client.on("disconnect", (dataRes) => {
  console.log("Client disconnect:");
  console.log(dataRes);
});

client.on(SocketConst.EMIT.JOIN_ROOM, (dataRes) => {
  console.log(\`\${SocketConst.EMIT.JOIN_ROOM} : dataRes:\`, dataRes);
});

client.on(SocketConst.EMIT.COLOR_OF_WILD, (dataRes) => {
  console.log(\`\${SocketConst.EMIT.COLOR_OF_WILD} : dataRes:\`, dataRes);

  const color = selectChangeColor();
  sendColorOfWild(color);
});

client.on(SocketConst.EMIT.NEXT_PLAYER, (dataRes) => {
  console.log(\`\${SocketConst.EMIT.NEXT_PLAYER} : dataRes:\`, dataRes);

  globalCards = dataRes.card_of_player;
  console.log(\`update globalCards: \${JSON.stringify(globalCards)}\`);

  /** 追加 ここから */
  if (dataRes.draw_reason === DrawReason.WILD_DRAW_4) {
    // チャンレンジを行うか判断するロジック
    const isChallengeData = isChallenge();
    sendChallenge(isChallengeData);
    if (isChallengeData) {
      return;
    }
  }
  /** 追加 ここまで */

  if (dataRes.must_call_draw_card) {
    sendDrawCard();
    return;
  }

  const playCard = selectPlayCard(dataRes.card_before);
  console.log(\`selected card: \${JSON.stringify(playCard)}\`);

  if (playCard) {
    // TODO 残り手札数を考慮してUNOコールを宣言する必要があります。
    sendPlayCard(playCard);
  } else {
    // 選出したカードが無かった時
    sendDrawCard();  // 追加
  }
});

client.on(SocketConst.EMIT.DRAW_CARD, (dataRes) => {
  console.log(\`\${SocketConst.EMIT.DRAW_CARD} : dataRes:\`, dataRes);

  if (dataRes.player !== id) {
    // 他のプレイヤーがカードを引いた時の通知は処理をしない
    return;
  }

  if (dataRes.can_play_draw_card) {
    // 引いたカードが場に出せるときはカードを出すか出さないかを選択する
    sendPlayDrawCard(true); // TODO 後で引数を決定する処理を追加する
    return;
  }
});

// （中略）各イベントの受信機能

function selectPlayCard(beforeCard) {
  // カードを選択する実装を自身で自由に記述してください。
}

function selectChangeColor() {
  // 変更する色を判定する実装を自身で自由に記述してください。
}

/** 追加 ここから */
function isChallenge() {
  // チャレンジを行うかを判定する実装を自身で自由に記述してください。
}
/** 追加 ここまで */

function sendJoinRoom() {
  const data = {
    room_name: roomName,
    player: player
  };

  console.log(\`Send \${SocketConst.EMIT.JOIN_ROOM} event.\`)
  client.emit(SocketConst.EMIT.JOIN_ROOM, data, (err, res) => {
    if (err) {
      console.log(\`Client \${SocketConst.EMIT.JOIN_ROOM} failed!\`);
      console.error(err);
      return;
    } else {
      console.log(\`Client \${SocketConst.EMIT.JOIN_ROOM} successfully!\`);
      console.log(res);
      id = res.your_id;
    }
  });
}

function sendColorOfWild(color) {
  const data = {
    color_of_wild: color
  };

  console.log(\`Send \${SocketConst.EMIT.COLOR_OF_WILD} event.\`)
  client.emit(SocketConst.EMIT.COLOR_OF_WILD, data, (err, res) => {
    if (err) {
      console.log(\`Client \${SocketConst.EMIT.COLOR_OF_WILD} failed!\`);
      console.error(err);
      return;
    } else {
      console.log(\`Client \${SocketConst.EMIT.COLOR_OF_WILD} successfully!\`);
      console.log(res);
    }
  });
}


function sendPlayCard(card) {
  const data = {
    card_play: card
  };

  client.emit(SocketConst.EMIT.PLAY_CARD, data, (err, res) => {
    if (err) {
      console.log(\`Client \${SocketConst.EMIT.PLAY_CARD} failed!\`);
      console.error(err);
      return;
    } else {
      console.log(\`Client \${SocketConst.EMIT.PLAY_CARD} successfully!\`);
      console.log(res);
    }
  });
}

function sendDrawCard() {
  const data = {};

  client.emit(SocketConst.EMIT.DRAW_CARD, data, (err, res) => {
    if (err) {
      console.log(\`Client \${SocketConst.EMIT.DRAW_CARD} failed!\`);
      console.error(err);
      return;
    } else {
      console.log(\`Client \${SocketConst.EMIT.DRAW_CARD} successfully!\`);
      console.log(res);
    }
  });
}

function sendPlayDrawCard(isPlayCard) {
  const data = {
    is_play_card: isPlayCard,
  };

  client.emit(SocketConst.EMIT.PLAY_DRAW_CARD, data, (err, res) => {
    if (err) {
      console.log(\`Client \${SocketConst.EMIT.PLAY_DRAW_CARD} failed!\`);
      console.error(err);
      return;
    } else {
      console.log(\`Client \${SocketConst.EMIT.PLAY_DRAW_CARD} successfully!\`);
      console.log(res);
    }
  });
}

/** 前STEPで実装済み ここから */
function sendChallenge(isChallenge) {
  if (isChallenge) {
    console.log("try challenge.");
  } else {
    console.log("not try challenge.");
  }

  const data = {
    is_challenge: isChallenge,
  };

  client.emit(SocketConst.EMIT.CHALLENGE, data, (err, res) => {
    if (err) {
      console.log("Client challenge failed!");
      console.error(err);
      return;
    } else {
      console.log("Client challenge successfully!");
      console.log(res);
    }
  });
}
/** 前STEPで実装済み ここまで */

// （中略）各イベントの送信関数

if (isTestTool) {
  if (eventName === SocketConst.EMIT.JOIN_ROOM) {
    sendJoinRoom();
    // （中略）各イベントのテスト実行判定
  } else {
    console.log("No event name");
  }
} else {
  sendJoinRoom();
}
`;

export const CodeConsts = {
  PREPARATION: {
    CREATE_PROJECT: {
      type: 'shell',
      commands: ['mkdir uno-player', 'cd uno-player', 'npm init'],
    },
    CREATE_PROGRAM_FILE: {
      type: 'shell',
      commands: ['touch player.js # windows: type nul > player.js'],
    },
    SPECIFY_SERVER: {
      type: 'javascript',
      file: 'player.js',
      source: specifyServer,
    },
    IS_TEST_TOOL: {
      type: 'javascript',
      file: 'player.js',
      source: isTestTool,
      commands: [
        `node player.js // Host missed`,
        `node player.js "http://localhost:3000" // Host: http://localhost:3000`,
      ],
    },
    SPECIFY_DEALER: {
      type: 'javascript',
      file: 'player.js',
      source: specifyDealer,
      commands: [
        `node player.js "http://localhost:3000" // Argments invalid`,
        `node player.js "http://localhost:3000" "TestDealer" // Dealer: TestDealer`,
      ],
    },
    SPECIFY_PLAYER: {
      type: 'javascript',
      file: 'player.js',
      source: specifyPlayer,
      commands: [
        `node player.js "http://localhost:3000" "TestDealer" // Argments invalid`,
        `node player.js "http://localhost:3000" "TestDealer" "TestPlayer1" // Dealer: TestDealer, Player: TestPlayer1`,
      ],
    },
    INSTALL_SOCKET_MODULE: {
      type: 'shell',
      commands: ['npm i -S socket.io-client@2.3.0'],
    },
    IMPORT_SOCKET_MODULE: {
      type: 'javascript',
      file: 'player.js',
      source: importSocketModule,
      commands: [
        `node player.js "http://localhost:3000" "TestDealer" "TestPlayer1" // Client connect successfully!`,
      ],
    },
  },
  PLAYER_TO_DEALER: {
    SPECIFY_EVENT_NAME: {
      type: 'javascript',
      file: 'player.js',
      source: specifyEventName,
    },
    CREATE_SEND_DATA_FUNCTION: {
      type: 'javascript',
      file: 'player.js',
      source: createSendDataFunction,
    },
    SEND_DATA_TO_DEALER: {
      type: 'shell',
      commands: [`node player.js "http://localhost:3000" "TestDealer" "TestPlayer1" "join-room"`],
    },
  },
  DEALER_TO_PLAYER: {
    CREATE_RECEIVE_DATA_FUNCTION: {
      type: 'javascript',
      file: 'player.js',
      source: createReceiveDataFunction,
    },
    SEND_DATA_TO_PLAYER: {
      type: 'shell',
      commands: [`node player.js "http://localhost:3000" "TestDealer" "TestPlayer1"`],
    },
  },
  DETAIL: {
    MANAGE_ID_AND_CARDS: {
      type: 'javascript',
      file: 'player.js',
      source: manageIdAndCards,
    },
    CREATE_CARD_SELECTING_FUNCTION: {
      type: 'javascript',
      file: 'player.js',
      source: createCardSelectingFunction,
    },
    EXECUTE_CARD_SELECTING_FUNCTION: {
      type: 'javascript',
      file: 'player.js',
      source: executeCardSelectingFunction,
    },
    CREATE_CHANGE_COLOR_FUNCTION: {
      type: 'javascript',
      file: 'player.js',
      source: createChangeColorFunction,
    },
    CREATE_CHALLENGE_FUNCTION: {
      type: 'javascript',
      file: 'player.js',
      source: createChallengeFunction,
    },
  },
};
