window.onload = function() {
  // Accède à la page active pour récupérer les informations
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const currentUrl = new URL(tabs[0].url);
    const statusDiv = document.getElementById('status');

    if (!currentUrl.href.startsWith('https://billetterie.psg.fr/')) {
      statusDiv.innerText = "Tu n'es pas sur Ticketplace, merci de t'y rendre avant de ré-essayer.";
      return;
    }

    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: getUserInfo
    }, (results) => {
      try {
        const decodedUserInfo = results[0].result;

        if (!decodedUserInfo.userEmail) {
          statusDiv.innerHTML = "<p>Tu n'es pas connecté à la billeterie, merci de te connecter avant de ré-essayer.</p>";
        } else {
          if (decodedUserInfo.hasExclu) {
            statusDiv.innerHTML = "<p>Tu as l'exclu Auteuil.</p><p>Tu verras des places lorsque des abonnés les mettront en vente.</p>";
          } else {
            statusDiv.innerHTML = `<p>Tu n'as actuellement pas l'exclu Auteuil.</p><p>Check si tu es bien connecté avec la même adresse mail que sur le forum.</p><p>Ici tu utilises: ${decodedUserInfo.userEmail}</p>`;
          }
        }
      } catch {
        statusDiv.innerHTML = "<p>Tu n'es pas sur une page de revente. Choisis un match et clique sur le bouton bleu \"TICKETPLACE\".</p>";
      }
    });
  });
};

function getUserInfo() {
  const encodedUserInfo = document.querySelector('body').getAttribute('data-ustatus');
  const decodedUserInfo = JSON.parse(atob(encodedUserInfo));

  const hasExclu = decodedUserInfo
    ?.tagging
    ?.user_load
    ?.user_population
    ?.split(', ')
    ?.some((e) => e === 'Exclusivité Auteuil');

  const userEmail = decodedUserInfo
    ?.tagging
    ?.user_load
    ?.user_email;

  return { hasExclu, userEmail };
}
