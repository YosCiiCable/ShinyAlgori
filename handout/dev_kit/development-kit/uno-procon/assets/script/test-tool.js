const baseUrl = `${window.location.origin}/api/v1/test-tool`;

function startTestStep(url) {
  window.location.href = `${baseUrl}/${url}`;
}
