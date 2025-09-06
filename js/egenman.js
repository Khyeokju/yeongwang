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

let currentQuestion = 0;
let responses = [];
let totalScore = 0;
let answers = []; // 답변 기록 저장 (yes/no)

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
      document.body.style.backgroundImage = `url("../images/man${nextImageNumber}.png")`;
      document.body.style.opacity = '1';
    }, 200);
  } else {
    localStorage.setItem("responses", JSON.stringify(responses));
    localStorage.setItem("tetoScore", totalScore);
    window.location.href = "result.html";
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
      document.body.style.backgroundImage = `url("../images/man${prevImageNumber}.png")`;
      document.body.style.opacity = '1';
    }, 200);
  }
}
