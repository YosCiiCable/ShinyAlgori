const baseUrl = `${window.location.origin}/api/v1/test-tool`;

const xhr = new XMLHttpRequest();

function sendDealerToPlayer(eventName, index) {
  xhr.open('GET', `${baseUrl}/dealer-to-player/${eventName}/${index}`, false);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send();
}
