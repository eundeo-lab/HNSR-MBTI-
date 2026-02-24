const main = document.querySelector("#main");
const qna = document.querySelector("#qna");
const result = document.querySelector("#result");

const endPoint = qnaList.length; // 질문 수에 따라 endPoint 자동 설정 

const answers = {};

let currentQIdx = 0;          // 현재 질문 인덱스(0부터)
const answerHistory = [];     // 선택 기록 스택: { qIdx, pick }

let gender = null;

function setGender(g) {
  gender = g;
  begin();
}

function setGender(g){
  gender = g;
  begin();
}

function calResult() {
  return calcMBTI(answers, gender);
}

function setResult() {
  const res = calResult();

  document.querySelector('.resultName').innerHTML = `당신의 MBTI: ${res.type}`;

  document.querySelector('.resultDesc').innerHTML =
    `E:${res.score.E} I:${res.score.I}<br>` +
    `S:${res.score.S} N:${res.score.N}<br>` +
    `T:${res.score.T} F:${res.score.F}<br>` +
    `J:${res.score.J} P:${res.score.P}`;

    window.__MBTI_RESULT__ = res; // share.js에서 바로 읽기
    localStorage.setItem("mbti_result", JSON.stringify(res));
}

function goResult() {
  qna.style.WebkitAnimation = "fadeOut 1s";
  qna.style.animation = "fadeOut 1s";
  setTimeout(() => {
    result.style.WebkitAnimation = "fadeIn 1s";
    result.style.animation = "fadeIn 1s";
    setTimeout(() => {
      qna.style.display = "none";
      result.style.display = "block";
    }, 450)
  })
  setResult();
}

function addAnswer(answerText, qIdx, idx) {
  var a = document.querySelector('.answerBox');
  var answer = document.createElement('button');
  answer.classList.add('answerList');
  answer.classList.add('my-3');
  answer.classList.add('py-3');
  answer.classList.add('mx-auto');
  answer.classList.add('fadeIn');

  a.appendChild(answer);
  answer.innerHTML = answerText;

  answer.addEventListener("click", function () {
    var children = document.querySelectorAll('.answerList');
    for (let i = 0; i < children.length; i++) {
      children[i].disabled = true;
      children[i].style.WebkitAnimation = "fadeOut 0.5s";
      children[i].style.animation = "fadeOut 0.5s";
    }
    setTimeout(() => {
      const choice = qnaList[qIdx].a[idx];
        
        if (choice.pick) {
          const key = `q${qIdx + 1}`;
          const pick = String(choice.pick || "").toUpperCase();
          answers[key] = pick;
          answerHistory.push({ qIdx, pick });
        }
          
          for (let i = 0; i < children.length; i++) {
          children[i].style.display = 'none';
        }
        goNext(++qIdx);
      }, 450);
  }, false);
}

function goNext(qIdx) {
  currentQIdx = qIdx;   // ✅ 추가

  if (qIdx === endPoint) {
    goResult();
    return;
  }

  var q = document.querySelector('.qBox');
  q.innerHTML = qnaList[qIdx].q;

  // ✅ 추가: 이전 버튼들 지우기(중복 방지)
  document.querySelector('.answerBox').innerHTML = "";

  for (let i in qnaList[qIdx].a) {
    addAnswer(qnaList[qIdx].a[i].answer, qIdx, i);
  }

  var status = document.querySelector('.statusBar');
  status.style.width = (100 / endPoint) * (qIdx + 1) + '%';

  updateBackButton(); // ✅ 추가
}

  var q = document.querySelector('.qBox');
  q.innerHTML = qnaList[qIdx].q;
  for (let i in qnaList[qIdx].a) {
    addAnswer(qnaList[qIdx].a[i].answer, qIdx, i);
  }
  var status = document.querySelector('.statusBar');
  status.style.width = (100 / endPoint) * (qIdx + 1) + '%';
}

function begin() {
  main.style.WebkitAnimation = "fadeOut 1s";
  main.style.animation = "fadeOut 1s";
  setTimeout(() => {
    qna.style.WebkitAnimation = "fadeIn 1s";
    qna.style.animation = "fadeIn 1s";
    setTimeout(() => {
      main.style.display = "none";
      qna.style.display = "block";
    }, 450);

    // ✅ 여기부터 추가/정리
    currentQIdx = 0;
    answerHistory.length = 0;

    // answers 초기화 (재시작 대비)
    for (const k in answers) delete answers[k];

    goNext(currentQIdx);
    updateBackButton();
  }, 450);
}

function calcMBTI(answers, gender) {
  const data = gender === "female" ? SCORING.female : SCORING.male;
  const points = data.points; // {"1": {"A":2, "B":1, ...}, ...}
  const axes = data.axes;     // {"E":[[1,"A"],...], "I":[...], ...}

  const score = { E:0, I:0, S:0, N:0, T:0, F:0, J:0, P:0 };

  for (const axis of Object.keys(score)) {
    const terms = axes[axis] || [];
    let s = 0;

    for (const [q, opt] of terms) {
      const ans = (answers[`q${q}`] || "").toUpperCase(); // "A" or "AC"
      if (!ans.includes(opt)) continue;

      const qKey = String(q);
      const p = (points[qKey] && points[qKey][opt] != null) ? points[qKey][opt] : 0;
      s += Number(p) || 0;
    }
    score[axis] = s;
  }

  const type =
    (score.E >= score.I ? "E" : "I") +
    (score.S >= score.N ? "S" : "N") +
    (score.T >= score.F ? "T" : "F") +
    (score.J >= score.P ? "J" : "P");

  return { type, score };
}

function updateBackButton() {
  const btn = document.getElementById("backBtn");
  if (!btn) return;
  btn.disabled = (currentQIdx <= 0);
}

function goBack() {
  if (currentQIdx <= 0) return;

  // 마지막 답 제거
  const last = answerHistory.pop();
  if (last) {
    delete answers[`q${last.qIdx + 1}`];
  }

  // 한 문항 뒤로
  currentQIdx -= 1;
  goNext(currentQIdx);
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("backBtn");
  if (btn) btn.addEventListener("click", goBack);
});