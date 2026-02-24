const url = 'https://localhost/';

function setShare() {
  var resultImg = document.querySelector('#resultImg')
  var resultAlt = resultImg.firstElementChild.alt;

  const shareTitle = '십이간지 연애유형 결과'
  const shareDes = infoList[resultAlt].name;
  const shareImgage = url + 'img/image-' + resultAlt + '.png';
  const shareURL = url + 'page/result-' + resultAlt + '.html';
}

// https://developers.kakao.com/docs/latest/ko/message/js-link#default-template-msg-custom
function kakakoShare() {
  Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: shareTitle,
      description: shareDes,
      imageUrl:shareImgage,
      link: {
        mobileWebUrl: shareURL,
        webUrl: shareURL
      },
    },
    
    buttons: [
      {
        title: '결과확인하기',
        link: {
          mobileWebUrl: shareURL,
          webUrl: shareURL,
        },
      },
    ],
  });
}