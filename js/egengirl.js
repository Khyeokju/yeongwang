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
  const scoreForThisAnswer = scores[currentQuestion][selectedIndex];
  totalScore += scoreForThisAnswer;

  // 답변 기록 저장 (yes/no)
  answers[currentQuestion] = selectedIndex === 0 ? 'yes' : 'no';
  
  responses.push({ answer: selectedIndex === 0 ? "그렇다" : "아니다" });
  currentQuestion++;

  if (currentQuestion < scores.length) {
    // 배경 이미지만 변경 (부드러운 전환)
    const nextImageNumber = currentQuestion + 1;
    document.body.style.opacity = '0.7';
    setTimeout(() => {
      document.body.style.backgroundImage = `url("../images/girl${nextImageNumber}.png")`;
      document.body.style.opacity = '1';
    }, 200);
  } else {
    // 분석 중 화면 표시
    showAnalysisScreen();
    
    // 결과를 localStorage에 저장하고 결과 페이지로 이동
    setTimeout(() => {
      localStorage.setItem("responses", JSON.stringify(responses));
      localStorage.setItem("tetoScore", totalScore);
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
    document.body.style.opacity = '0.7';
    setTimeout(() => {
      document.body.style.backgroundImage = `url("../images/girl${prevImageNumber}.png")`;
      document.body.style.opacity = '1';
    }, 200);
  }
}


