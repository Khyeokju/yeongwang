let currentQuestion = 0;
let responses = [];
let answers = []; // 답변 기록 저장 (yes/no)

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

let totalScore = 0;
let egenCount = 0; // 에겐 응답 개수
(function(){ try{ localStorage.removeItem('egenCount'); }catch(e){} })();

// 다음 배경만 선행 로드 (가벼운 프리로딩)
let nextPreloadImg = null;
function preloadNext(questionIdxZeroBased) {
  const nextNum = questionIdxZeroBased + 2; // 현재가 0이면 다음은 2 (girl2)
  if (nextNum <= 10) {
    nextPreloadImg = new Image();
    nextPreloadImg.src = `../images/girl${nextNum}.png`;
  } else {
    nextPreloadImg = null;
  }
}
// 첫 진입 시 2번째 배경만 선행 로드
preloadNext(0);

// 별자리 페이지와 동일한 방식의 배경 전환
function changeBackgroundImage(questionNumber) {
  document.body.style.transition = 'opacity 0.15s ease-in-out';
  document.body.style.opacity = '0.5';
  requestAnimationFrame(() => {
    // 화면 전체 배경 전환 보장: html + body 모두 변경
    document.documentElement.style.backgroundImage = `url("../images/girl${questionNumber}.png")`;
    document.documentElement.style.backgroundSize = 'cover';
    document.documentElement.style.backgroundPosition = 'center';
    document.documentElement.style.backgroundRepeat = 'no-repeat';

    document.body.style.backgroundImage = `url("../images/girl${questionNumber}.png")`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
    requestAnimationFrame(() => {
      document.body.style.opacity = '1';
    });
  });
}

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
  // 여자 에겐 규칙: 1,2,3,4,6,8,10 = yes가 에겐 / 5,7,9 = no가 에겐
  const scoreForThisAnswer = scores[currentQuestion][selectedIndex];
  totalScore += scoreForThisAnswer;

  const oneBased = currentQuestion + 1;
  const isYes = selectedIndex === 0;
  const egenYesSet = new Set([1,2,3,4,6,8,10]);
  const egenNoSet = new Set([5,7,9]);
  if ((egenYesSet.has(oneBased) && isYes) || (egenNoSet.has(oneBased) && !isYes)) {
    egenCount++;
  }

  // 답변 기록 저장 (yes/no)
  answers[currentQuestion] = selectedIndex === 0 ? 'yes' : 'no';
  
  responses.push({ answer: selectedIndex === 0 ? "그렇다" : "아니다" });
  currentQuestion++;

  if (currentQuestion < scores.length) {
    // 다음 배경을 선행 로드 후 전체 배경 전환
    if (nextPreloadImg && nextPreloadImg.complete) {
      changeBackgroundImage(currentQuestion + 1);
    } else if (nextPreloadImg) {
      nextPreloadImg.onload = () => changeBackgroundImage(currentQuestion + 1);
    } else {
      changeBackgroundImage(currentQuestion + 1);
    }
    // 그 다음 배경 프리로드 준비
    preloadNext(currentQuestion);
  } else {
    // 분석 중 화면 표시
    showAnalysisScreen();
    
    // 결과를 localStorage에 저장하고 결과 페이지로 이동
    setTimeout(() => {
      localStorage.setItem("responses", JSON.stringify(responses));
      localStorage.setItem("tetoScore", totalScore);
      localStorage.setItem("egenCount", String(egenCount));
      localStorage.setItem('gender', 'female');
      window.location.href = "result.html";
    }, 2000); // 2초 후 결과 페이지로 이동
  }
}

// 뒤로가기 함수
function goBack() {
  if (currentQuestion === 0) {
    // 첫 번째 질문일 때는 홈으로
    location.href = '../index.html';
  } else {
    // 2번째 질문 이상일 때는 이전 질문으로
    currentQuestion--;
    
    // 이전 답변에 따른 점수 차감
    const previousAnswer = answers[currentQuestion];
    if (previousAnswer === 'yes') {
      totalScore -= scores[currentQuestion][0]; // 그렇다 점수 차감
    } else {
      totalScore -= scores[currentQuestion][1]; // 아니다 점수 차감
    }
    
    // 이전 답변 기록 제거
    answers[currentQuestion] = undefined;
    responses.pop(); // 마지막 응답 제거
    
    // 이전 질문 배경으로 변경 (부드러운 전환)
    const prevImageNumber = currentQuestion + 1;
    changeBackgroundImage(prevImageNumber);
  }
}


