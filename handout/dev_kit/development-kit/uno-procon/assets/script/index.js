const baseUrl = `${window.location.origin}/api/v1/admin`;
const DEALER = 'dealer';

const xhr = new XMLHttpRequest();

function reload() {
  location.reload();
}

function addDealer() {
  const nameElement = document.getElementById('new-dealer-name');
  const totalElment = document.getElementById('total-turn');
  const messageElement = document.getElementById('api-message');
  const whiteWildElement = document.getElementById('white-wild');
  if (!nameElement || !totalElment || !messageElement) {
    console.log('構文エラー');
    return;
  }

  messageElement.classList.remove('error');
  messageElement.innerHTML = '';

  const name = nameElement.value;
  const totalTurn = totalElment.value;
  const whiteWild = whiteWildElement.value;

  if (!name || !totalTurn) {
    messageElement.classList.add('error');
    messageElement.innerHTML = 'ディーラー名と試合数を入力してください。';
    return;
  }

  xhr.open('POST', `${baseUrl}/${DEALER}`, false);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status !== 200) {
      console.log(xhr.responseText);
      messageElement.classList.add('error');
      switch (JSON.parse(xhr.responseText).message) {
        case 'Dealer exists with same name.':
          messageElement.innerHTML = '既に存在しているディーラー名です。';
          break;
        default:
          messageElement.innerHTML = '予期せぬエラーが発生しました。';
          break;
      }
    } else {
      location.reload();
    }
  };
  xhr.send(JSON.stringify({ name, totalTurn, whiteWild }));
}

function startDealer(id) {
  const messageElement = document.getElementById('api-message');
  if (!messageElement) {
    console.log('構文エラー');
    return;
  }

  xhr.open('POST', `${baseUrl}/${DEALER}/${id}/start-dealer`, false);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status !== 200) {
      console.log(xhr.responseText);

      messageElement.classList.add('error');
      switch (JSON.parse(xhr.responseText).message) {
        case 'Number of player join dealer lower two.':
        case 'Number of socket client join dealer lower two.':
          messageElement.innerHTML = '接続しているプレイヤーが不足しています。';
          break;

        default:
          messageElement.innerHTML = '予期せぬエラーが発生しました。';
          break;
      }
      if (xhr.responseText.includes("Cannot read properties of undefined (reading 'emit')")) {
        messageElement.innerHTML =
          'このコンテナ以外のディーラに接続しているプレイヤーが存在する可能性があります。';
      }
    } else {
      messageElement.innerHTML = `${id}の試合を開始しました。`;
    }
  };
  xhr.send();
}
