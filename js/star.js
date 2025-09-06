// 별자리 테스트 점수 배열 (각 질문별로 yes/no에 따른 점수)
// 12가지 별자리가 균등하게 나올 수 있도록 설계
const scores = [
    { yes: 2, no: 1 },  // 질문 1
    { yes: 2, no: 1 },  // 질문 2
    { yes: 2, no: 1 },  // 질문 3
    { yes: 2, no: 1 },  // 질문 4
    { yes: 2, no: 1 },  // 질문 5
    { yes: 2, no: 1 },  // 질문 6
    { yes: 2, no: 1 },  // 질문 7
    { yes: 2, no: 1 },  // 질문 8
    { yes: 2, no: 1 },  // 질문 9
    { yes: 2, no: 1 }   // 질문 10
];

let currentQuestion = 0;
let totalScore = 0;
let answers = []; // 답변 기록 저장

// 이미지 프리로딩 함수
function preloadImages() {
    const images = [];
    for (let i = 1; i <= 10; i++) {
        const img = new Image();
        img.src = `../images/star${i}.png`;
        images.push(img);
    }
    return images;
}

// 페이지 로드 시 이미지 프리로딩
const preloadedImages = preloadImages();

// 배경 이미지 변경 함수
function changeBackgroundImage(questionNumber) {
    // 부드러운 배경 전환을 위한 fade 효과
    document.body.style.transition = 'opacity 0.3s ease-in-out';
    document.body.style.opacity = '0.3';
    
    setTimeout(() => {
        document.body.style.backgroundImage = `url("../images/star${questionNumber}.png")`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 50);
    }, 300);
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
            <div class="analysis-icon">✨</div>
            <div class="analysis-text">분석 중이니 조금만 기다려주세요...</div>
            <div class="analysis-subtitle">당신의 별자리를 찾고 있어요</div>
            <div class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    document.body.appendChild(analysisScreen);
}

// 답변 처리 함수
function handleAnswer(answer) {
    // 답변 기록 저장
    answers[currentQuestion] = answer;
    
    // 현재 질문의 점수 계산
    if (answer === 'yes') {
        totalScore += scores[currentQuestion].yes;
    } else {
        totalScore += scores[currentQuestion].no;
    }
    
    currentQuestion++;
    
    // 다음 질문이 있으면 배경 이미지 변경
    if (currentQuestion < 10) {
        // 프리로딩된 이미지 사용
        const nextImage = preloadedImages[currentQuestion];
        
        if (nextImage.complete) {
            // 이미 로드된 경우 즉시 전환
            changeBackgroundImage(currentQuestion + 1);
        } else {
            // 아직 로딩 중인 경우 로드 완료 후 전환
            nextImage.onload = () => {
                changeBackgroundImage(currentQuestion + 1);
            };
        }
    } else {
        // 10번째 질문 완료 후 결과 페이지로 이동
        // 12가지 별자리가 균등하게 나올 수 있도록 설계
        let result, personality;
        if (totalScore <= 10) {
            result = '물고기자리';
            personality = '감정이 풍부하고 직감적인 성격으로, 다른 사람의 감정을 잘 이해하고 공감능력이 뛰어납니다. 예술적 감각이 있고 꿈꾸는 것을 좋아하며, 때로는 현실과 꿈의 경계가 모호할 수 있습니다.';
        } else if (totalScore <= 11) {
            result = '양자리';
            personality = '열정적이고 도전적인 성격으로, 새로운 일에 대한 모험심이 강합니다. 리더십이 있고 독립적인 성향이 강하며, 빠른 판단과 행동으로 목표를 달성하는 것을 좋아합니다.';
        } else if (totalScore <= 12) {
            result = '황소자리';
            personality = '안정적이고 신중한 성격으로, 한번 정한 목표를 향해 꾸준히 나아갑니다. 실용적이고 현실적인 사고방식을 가지고 있으며, 신뢰할 수 있고 책임감이 강합니다.';
        } else if (totalScore <= 13) {
            result = '쌍둥이자리';
            personality = '호기심이 많고 적응력이 뛰어난 성격으로, 다양한 정보와 지식을 습득하는 것을 좋아합니다. 소통능력이 뛰어나고 다재다능하지만, 때로는 집중력이 부족할 수 있습니다.';
        } else if (totalScore <= 14) {
            result = '게자리';
            personality = '가족과 가정을 중시하는 따뜻하고 보호적인 성격입니다. 감정이 풍부하고 기억력이 좋으며, 과거의 경험을 소중히 여깁니다. 때로는 과민하고 방어적일 수 있습니다.';
        } else if (totalScore <= 15) {
            result = '사자자리';
            personality = '자신감 넘치고 카리스마 있는 성격으로, 주목받는 것을 좋아합니다. 관대하고 따뜻한 마음을 가지고 있으며, 창의적이고 예술적 감각이 뛰어납니다.';
        } else if (totalScore <= 16) {
            result = '처녀자리';
            personality = '꼼꼼하고 분석적인 성격으로, 완벽주의적 성향이 있습니다. 실용적이고 논리적인 사고방식을 가지고 있으며, 다른 사람을 돕는 것을 좋아합니다.';
        } else if (totalScore <= 17) {
            result = '천칭자리';
            personality = '균형과 조화를 중시하는 공정하고 외교적인 성격입니다. 다른 사람의 의견을 잘 듣고 중재하는 능력이 뛰어나며, 아름다움과 예술을 추구합니다.';
        } else if (totalScore <= 18) {
            result = '전갈자리';
            personality = '강한 의지와 집중력을 가진 신중하고 분석적인 성격입니다. 직감이 뛰어나고 깊이 있는 사고를 하며, 한번 정한 목표를 향해 끈질기게 나아갑니다.';
        } else if (totalScore <= 19) {
            result = '궁수자리';
            personality = '자유롭고 낙관적인 성격으로, 모험과 여행을 좋아합니다. 철학적 사고와 지적 호기심이 많으며, 진실과 정의를 추구하는 열정적인 성향이 있습니다.';
        } else if (totalScore <= 20) {
            result = '염소자리';
            personality = '책임감이 강하고 야망이 있는 성격으로, 장기적인 목표를 향해 꾸준히 노력합니다. 현실적이고 실용적인 사고방식을 가지고 있으며, 성공을 추구합니다.';
        } else {
            result = '물병자리';
            personality = '독창적이고 혁신적인 사고를 가진 독립적인 성격입니다. 인도주의적이고 진보적인 가치관을 가지고 있으며, 친구들과의 관계를 중시합니다.';
        }
        
        // 분석 중 화면 표시
        showAnalysisScreen();
        
        // 결과를 localStorage에 저장하고 결과 페이지로 이동
        setTimeout(() => {
            localStorage.setItem('starResult', result);
            localStorage.setItem('starConstellation', result); // 별자리 이름도 별도로 저장
            localStorage.setItem('starPersonality', personality);
            location.href = './starresult.html';
        }, 2000); // 2초 후 결과 페이지로 이동
    }
}

// 뒤로가기 함수
function goBack() {
    if (currentQuestion === 0) {
        // 첫 번째 질문일 때는 홈으로
        location.href = '../index2.html';
    } else {
        // 2번째 질문 이상일 때는 이전 질문으로
        currentQuestion--;
        
        // 이전 답변에 따른 점수 차감
        const previousAnswer = answers[currentQuestion];
        if (previousAnswer === 'yes') {
            totalScore -= scores[currentQuestion].yes;
        } else {
            totalScore -= scores[currentQuestion].no;
        }
        
        // 이전 답변 기록 제거
        answers[currentQuestion] = undefined;
        
        // 이전 질문 배경으로 변경
        changeBackgroundImage(currentQuestion + 1);
    }
}
