const questions = [
  {
    page: "[1/10]",
    question: "장비를 새로 살 땐 실용성보단 감성적인 디자인을 중요시한다.",
    answers: ["그렇다", "아니다"]
  },
  {
    page: "[2/10]",
    question: "야외보단 카라반이나 글램핑처럼 꾸며진 공간이 좋다.",
    answers: ["그렇다", "아니다"]
  },
  {
    page: "[3/10]",
    question: "빠진 짐이 있는지 꼼꼼히 점검하는 편이다.",
    answers: ["그렇다", "아니다"]
  },
  {
    page: "[4/10]",
    question: "짐이 좀 무겁더라도 내가 좋아하는 아이템은 꼭 챙긴다.",
    answers: ["그렇다", "아니다"]
  },
  {
    page: "[5/10]",
    question: "응급 상황에 대비해 구급약이나 비상용품을 챙기는 편이다.",
    answers: ["그렇다", "아니다"]
  },
  {
    page: "[6/10]",
    question: "캠핑장에서 화장하거나 스타일링도 나름 신경 쓰는 편이다.",
    answers: ["그렇다", "아니다"]
  },
  {
    page: "[7/10]",
    question: "고기를 먹을 때 직접 나서서 굽는 편이다.",
    answers: ["그렇다", "아니다"]
  },
  {
    page: "[8/10]",
    question: "벌레가 몸에 붙으면 겁먹지 않고 털어내는 편이다.",
    answers: ["그렇다", "아니다"]
  },
  {
    page: "[9/10]",
    question: "밤에 텐트 안에서 무드등을 켜고 음악을 듣거나 영화를 보는 것을 좋아한다.",
    answers: ["그렇다", "아니다"]
  },
  {
    page: "[10/10]",
    question: "캠핑 사진은 예쁘게 찍어서 인스타그램에 올리는 편이다.",
    answers: ["그렇다", "아니다"]
  }
];

let currentQuestion = 0;
let responses = [];

// 다음 배경만 선행 로드 (전체 프리로딩은 지양)
let nextPreloadImg = null;
function preloadNext(questionIdxZeroBased) {
  const nextNum = questionIdxZeroBased + 2; // 현재 0이면 다음은 2
  if (nextNum <= 10) {
    nextPreloadImg = new Image();
    nextPreloadImg.src = `../images/girl${nextNum}.png`;
  } else {
    nextPreloadImg = null;
  }
}

function changeBackgroundImage(questionNumber) {
  document.body.style.transition = 'opacity 0.15s ease-in-out';
  document.body.style.opacity = '0.5';
  requestAnimationFrame(() => {
    document.body.style.backgroundImage = `url("../images/girl${questionNumber}.png")`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
    requestAnimationFrame(() => {
      document.body.style.opacity = '1';
    });
  });
}

// 첫 진입 시 2번째 배경만 선행 로드
preloadNext(0);

function renderQuestion() {
  const q = questions[currentQuestion];
  
  // 즉시 내용 업데이트 (애니메이션 없이)
  document.getElementById("progressText").textContent = q.page;
  document.getElementById("questionText").textContent = q.question;
  
  const container = document.getElementById("answerButtons");
  container.innerHTML = "";
  q.answers.forEach((answer, index) => {
    const btn = document.createElement("button");
    btn.className = `btn ${answer === "그렇다" ? "yes-btn" : "no-btn"}`; 
    btn.textContent = answer;
    btn.innerHTML = `<span>${answer}</span>`;
    btn.onclick = () => handleAnswer(index);
    container.appendChild(btn);
  });
  
  // 빠른 페이드 인 효과
  const questionContainer = document.querySelector('.question-container');
  questionContainer.style.opacity = '0';
  questionContainer.style.transform = 'translateY(10px)';
  
  // requestAnimationFrame을 사용한 부드러운 애니메이션
  requestAnimationFrame(() => {
    questionContainer.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    questionContainer.style.opacity = '1';
    questionContainer.style.transform = 'translateY(0)';
  });
}

const scores = [
  [15, -15],  // 1번: 테토
  [15, -15],  // 2번: 테토
  [-12, 12],  // 3번: 에겐
  [12, -12],  // 4번: 테토
  [-15, 15],  // 5번: 에겐
  [12, -12],  // 6번: 테토
  [-10, 10],  // 7번: 에겐
  [-10, 10],  // 8번: 에겐
  [10, -10],  // 9번: 테토
  [15, -15]   // 10번: 테토
];

let totalScore = 0;  // 전역에서 누적
let egenCount = 0;   // 에겐 응답 개수

// 분석 중 화면 표시 함수
function showAnalysisScreen() {
  // 기존 질문 컨테이너 숨기기
  const questionContainer = document.querySelector('.question-container');
  if (questionContainer) {
    questionContainer.style.display = 'none';
  }
  
  // 분석 중 화면 생성
  const analysisScreen = document.createElement('div');
  analysisScreen.id = 'analysis-screen';
  analysisScreen.innerHTML = `
    <div class="analysis-content">
      <div class="analysis-icon">🏕️</div>
      <div class="analysis-text">분석 중이니 조금만 기다려주세요...</div>
      <div class="analysis-subtitle">당신의 성향을 분석하고 있어요</div>
      <div class="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;
  
  document.body.appendChild(analysisScreen);
}

function handleAnswer(selectedIndex) {
  // 에겐 응답 규칙(여자):
  // 1,2,3,4,6,8,10번은 yes가 에겐 / 5,7,9번은 no가 에겐
  const q = questions[currentQuestion];
  const scoreForThisAnswer = scores[currentQuestion][selectedIndex]; // 해당 선택지 점수
  totalScore += scoreForThisAnswer;

  const qIndex = currentQuestion; // 0-based
  const oneBased = qIndex + 1;
  const isYes = selectedIndex === 0;
  const egenYesSet = new Set([1,2,3,4,6,8,10]);
  const egenNoSet = new Set([5,7,9]);
  if ((egenYesSet.has(oneBased) && isYes) || (egenNoSet.has(oneBased) && !isYes)) {
    egenCount++;
  }

  responses.push({ question: q.question, answer: q.answers[selectedIndex] });
  currentQuestion++;

  // 버튼 클릭 피드백 효과 (즉시)
  const clickedBtn = event.target;
  clickedBtn.style.transform = 'scale(0.95)';
  clickedBtn.style.opacity = '0.7';
  
  // 최소한의 딜레이로 즉시 처리
  requestAnimationFrame(() => {
    if (currentQuestion < questions.length) {
      // 다음 배경만 선행 로드 후 교체
      if (nextPreloadImg && nextPreloadImg.complete) {
        changeBackgroundImage(currentQuestion + 1);
      } else if (nextPreloadImg) {
        nextPreloadImg.onload = () => changeBackgroundImage(currentQuestion + 1);
      } else {
        changeBackgroundImage(currentQuestion + 1);
      }
      // 그 다음 배경을 프리로드 준비
      preloadNext(currentQuestion);
      renderQuestion();
    } else {
      // 분석 중 화면 표시
      showAnalysisScreen();
      
      // 결과를 localStorage에 저장하고 결과 페이지로 이동 (1초)
      setTimeout(() => {
        localStorage.setItem("responses", JSON.stringify(responses));
        localStorage.setItem("tetoScore", totalScore); // 점수 저장
        localStorage.setItem("egenCount", egenCount);  // 에겐 응답 개수 저장
        window.location.href = "result.html";
      }, 1000);
    }
  });
}


window.onload = function() {
  try { localStorage.removeItem('egenCount'); } catch (e) {}
  egenCount = 0;
  renderQuestion();
};