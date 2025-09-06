const questions = [
  {
    page: "[1/10]",
    question: "장비를 새로 살 땐 실용성보단 감성적인 디자인을 중요시한다.",
    answers: ["그렇다", "아니다"]
  },
  {
    page: "[2/10]",
    question: "텐트 설치 매뉴얼을 꼭 읽고 설치하는 편이다.",
    answers: ["그렇다", "아니다"]
  },
  {
    page: "[3/10]",
    question: "타지않기 위해 썬크림을 바르는 편이다.",
    answers: ["그렇다", "아니다"]
  },
  {
    page: "[4/10]",
    question: "빠진 짐이 있는지 꼼꼼히 점검하는 편이다.",
    answers: ["그렇다", "아니다"]
  },
  {
    page: "[5/10]",
    question: "응급 상황에 대비해 구급약이나 비상용품을 챙기는 편이다.",
    answers: ["그렇다", "아니다"]
  },
  {
    page: "[6/10]",
    question: "벌레가 나타나면 두려워하지 않고 잡는 편이다.",
    answers: ["그렇다", "아니다"]
  },
  {
    page: "[7/10]",
    question: "고기를 먹을 때 직접 나서서 굽는 편이다.",
    answers: ["그렇다", "아니다"]
  },
  {
    page: "[8/10]",
    question: "밤에 텐트 안에서 무드등을 켜고 음악을 듣거나 영화를 보는 것을 좋아한다.",
    answers: ["그렇다", "아니다"]
  },
  {
    page: "[9/10]",
    question: "밤하늘의 별을 보는 것이 캠핑의 묘미라고 생각한다.",
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


function renderQuestion() {
  const q = questions[currentQuestion];
  
  // 페이드 아웃 효과
  const questionContainer = document.querySelector('.button_container');
  questionContainer.style.opacity = '0';
  questionContainer.style.transform = 'translateY(30px)';
  
  setTimeout(() => {
    // 내용 업데이트
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
    
    // 페이드 인 효과
    questionContainer.style.opacity = '1';
    questionContainer.style.transform = 'translateY(0)';
  }, 400);
}

const scores = [
  [15, -15],   // 1번: 테토
  [-12, 12],   // 2번: 에겐
  [8, -8],     // 3번: 테토
  [-15, 15],   // 4번: 에겐
  [-15, 15],   // 5번: 에겐
  [-10, 10],   // 6번: 에겐
  [-10, 10],   // 7번: 에겐
  [10, -10],   // 8번: 테토
  [8, -8],     // 9번: 테토
  [15, -15]    // 10번: 테토
];


let totalScore = 0;  // 전역에서 누적

function handleAnswer(selectedIndex) {
  const q = questions[currentQuestion];
  const scoreForThisAnswer = scores[currentQuestion][selectedIndex]; // 해당 선택지 점수
  totalScore += scoreForThisAnswer;

  responses.push({ question: q.question, answer: q.answers[selectedIndex] });
  currentQuestion++;

  // 버튼 클릭 피드백 효과
  const clickedBtn = event.target;
  clickedBtn.style.transform = 'scale(0.95)';
  clickedBtn.style.opacity = '0.7';
  
  setTimeout(() => {
    if (currentQuestion < questions.length) {
      renderQuestion();
    } else {
      localStorage.setItem("responses", JSON.stringify(responses));
      localStorage.setItem("tetoScore", totalScore); // 점수 저장
      window.location.href = "result.html";
    }
  }, 200);
}


window.onload = renderQuestion;