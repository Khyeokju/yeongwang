// QR 코드 업로드 활성화
firebase.initializeApp(window.__FIREBASE_CONFIG__);
const storage = firebase.storage();

// 프레임별 카메라 박스 위치/크기 프리셋 (필요 시 숫자만 조정)
const DEFAULT_PHOTO_BOX = { top: '18.7%', left: '35%', width: '30%', height: '36%' };
const PHOTO_BOX_PRESETS = {
  // 모든 프레임 동일하게 쓸 경우 기본값만 사용
  egenman1: { ...DEFAULT_PHOTO_BOX },
  egenman2: { ...DEFAULT_PHOTO_BOX },
  egenman3: { ...DEFAULT_PHOTO_BOX },
  egengirl1: { ...DEFAULT_PHOTO_BOX },
  egengirl2: { ...DEFAULT_PHOTO_BOX },
  egengirl3: { ...DEFAULT_PHOTO_BOX },
  tetoman1: { ...DEFAULT_PHOTO_BOX },
  tetoman2: { ...DEFAULT_PHOTO_BOX },
  tetoman3: { ...DEFAULT_PHOTO_BOX },
  tetogirl1: { ...DEFAULT_PHOTO_BOX },
  tetogirl2: { ...DEFAULT_PHOTO_BOX },
  tetogirl3: { ...DEFAULT_PHOTO_BOX }
};

// 하나의 ROI(정규화 좌표: 0~1)로 모든 해상도/기기에서 동일 위치 유지
// 기존 CSS 비율(18.7%, 35%, 30%, 36%)을 0~1로 환산
const CAMERA_ROI = { top: 0.187, left: 0.35, width: 0.30, height: 0.36 };

function applyPhotoBoxPreset(frameKey) {
  const preset = PHOTO_BOX_PRESETS[frameKey] || DEFAULT_PHOTO_BOX;
  const box = document.getElementById('photo-box');
  if (!box) return;
  box.style.top = preset.top;
  box.style.left = preset.left;
  box.style.width = preset.width;
  box.style.height = preset.height;
}

// object-fit: cover로 인해 발생하는 크롭을 보정하여 #photo-box를 정확히 맞춤
function updatePhotoBoxResponsive() {
  const imgEl = document.getElementById('result-bg');
  const box = document.getElementById('photo-box');
  if (!imgEl || !box) return;

  const naturalW = imgEl.naturalWidth || 1080;
  const naturalH = imgEl.naturalHeight || 1920;
  const containerRect = imgEl.getBoundingClientRect();
  const containerW = containerRect.width;
  const containerH = containerRect.height;

  // cover 스케일 계산
  const scale = Math.max(containerW / naturalW, containerH / naturalH);
  const displayedW = naturalW * scale;
  const displayedH = naturalH * scale;

  // 컨테이너 기준으로 크롭된 양 (이미지의 중앙 크롭)
  const cropX = (displayedW - containerW) / 2; // 좌우 크롭
  const cropY = (displayedH - containerH) / 2; // 상하 크롭

  // ROI(이미지 기준)를 컨테이너 좌표계(px)로 변환
  const leftPx = CAMERA_ROI.left * displayedW - cropX;
  const topPx = CAMERA_ROI.top * displayedH - cropY;
  const widthPx = CAMERA_ROI.width * displayedW;
  const heightPx = CAMERA_ROI.height * displayedH;

  // 절대 위치(px)로 설정하여 기기/해상도/회전에 관계없이 일관 유지
  box.style.left = `${leftPx}px`;
  box.style.top = `${topPx}px`;
  box.style.width = `${widthPx}px`;
  box.style.height = `${heightPx}px`;
  box.style.position = 'absolute';
}

// dynamic ROI disabled; using CSS percentages for #photo-box
// window.addEventListener('resize', () => {
//   setTimeout(updatePhotoBoxResponsive, 50);
// });
// window.addEventListener('orientationchange', () => setTimeout(updatePhotoBoxResponsive, 150));

function initCameraAndCapture() {
  const video = document.getElementById("webcam");
  const canvas = document.getElementById("snapshot");
  const img = document.getElementById("captured-image");
  const countdownEl = document.getElementById("countdown");

  // 고화질 카메라 설정
  const constraints = {
    video: {
      width: { ideal: 1920, min: 1280 },
      height: { ideal: 1080, min: 720 },
      frameRate: { ideal: 30, min: 15 },
      facingMode: "user"
    }
  };

  navigator.mediaDevices.getUserMedia(constraints).then(stream => {
    video.srcObject = stream;
    // 카메라 좌우반전
    video.style.transform = "scaleX(-1)";
    video.style.transformOrigin = "center";
    
    // 카메라 해상도 정보 표시 (디버깅용)
    video.onloadedmetadata = () => {
      console.log(`카메라 해상도: ${video.videoWidth}x${video.videoHeight}`);
    };

    let timeLeft = 7;
    countdownEl.textContent = timeLeft; 
    const timer = setInterval(() => {
      timeLeft--;
      countdownEl.textContent = timeLeft;
      if (timeLeft === 0) {
        clearInterval(timer);

        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        const cropTop = videoHeight * 0.02;
        const cropHeight = videoHeight * 0.9;

        canvas.width = videoWidth;
        canvas.height = videoHeight;

        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        
        // 좌우반전을 위해 캔버스에 반전 변환 적용
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(
          video,
          0, cropTop,
          videoWidth, cropHeight,
          0, 0,
          canvas.width, canvas.height
        );
        ctx.restore();

        // 무손실에 가까운 PNG로 유지하여 중간 단계 압축 손실 방지
        const dataUrl = canvas.toDataURL("image/png");

        stream.getTracks().forEach(track => track.stop());
        video.style.display = "none";
        img.src = dataUrl;
        img.style.display = "block";
        countdownEl.style.display = "none";

        // 버튼 표시: 재촬영 / QR 생성하기
        let actions = document.getElementById("action-buttons");
        const qrContainer = document.getElementById("qrcode");
        const photoArea = document.getElementById("photo-area");
        const qrcodeEl = document.getElementById("qrcode");
        // 버튼 DOM이 없으면 생성 (우선 qrcode 내부에 삽입)
        if (!actions && (qrcodeEl || photoArea)) {
          actions = document.createElement("div");
          actions.id = "action-buttons";
          actions.className = "action-buttons";
          const retakeBtnEl = document.createElement("button");
          retakeBtnEl.id = "retake-btn";
          retakeBtnEl.className = "btn retake-btn";
          retakeBtnEl.innerHTML = '<span>재촬영</span>';
          const genBtnEl = document.createElement("button");
          genBtnEl.id = "generate-qr-btn";
          genBtnEl.className = "btn generate-btn";
          genBtnEl.innerHTML = '<span>QR코드 생성하기</span>';
          actions.appendChild(retakeBtnEl);
          actions.appendChild(genBtnEl);
          if (qrcodeEl) {
            qrcodeEl.appendChild(actions);
          } else if (photoArea) {
            photoArea.appendChild(actions);
          }
        }
        if (actions) {
          actions.classList.add("show");
          const retakeBtn = document.getElementById("retake-btn");
          const genBtn = document.getElementById("generate-qr-btn");

          if (retakeBtn) {
            retakeBtn.onclick = () => {
              // UI 리셋
              const videoEl = document.getElementById("webcam");
              if (videoEl) videoEl.style.display = "block";
              img.style.display = "none";
              countdownEl.style.display = "block";
              actions.classList.remove("show");
              if (qrContainer) {
                qrContainer.classList.remove("qr-active");
                qrContainer.innerHTML = "";
              }
              // 재촬영 시작
              initCameraAndCapture();
            };
          }

          if (genBtn) {
            genBtn.onclick = () => {
              actions.classList.remove("show");
              if (qrContainer) {
                qrContainer.classList.add("qr-active");
              }
              // 표시 강제
              actions.style.display = "none";
              showQRLoading();
              captureFullFrameAndUpload();
            };
          }
        }
      }
    }, 1000);
  }).catch(err => {
    console.error("카메라 접근 실패:", err);
    alert("카메라에 접근할 수 없습니다. 카메라 권한을 확인해주세요.");
  });
}

function captureFullFrameAndUpload() {
  const area = document.getElementById("capture-area");
  const video = document.getElementById("webcam");

  video.remove();

  const img = document.getElementById("captured-image");

  const startHtml2Canvas = () => {
    const targetScale = (() => {
      if (img && img.naturalWidth && img.clientWidth) {
        const ratio = img.naturalWidth / Math.max(1, img.clientWidth);
        return Math.max(1.5, Math.min(3, ratio));
      }
      return Math.min((window.devicePixelRatio || 1), 2);
    })();
    html2canvas(area, {
      useCORS: true,
      backgroundColor: null,
      scale: targetScale
    }).then(canvas => {
      canvas.toBlob(blob => {
        if (!blob) {
          console.error("Blob 생성 실패");
          return;
        }

        const fileName = `results/${Date.now()}.png`;
        const storageRef = storage.ref().child(fileName);

        console.log("Firebase Storage 업로드 시작");

        storageRef.put(blob).then(snapshot => {
          console.log("업로드 완료:", snapshot);
          return snapshot.ref.getDownloadURL();
        }).then(downloadURL => {
          console.log("다운로드 URL:", downloadURL);

          const qr = new QRious({
            element: document.createElement("canvas"),
            value: downloadURL,
            size: 260
          });

          const qrContainer = document.getElementById("qrcode");
          removeQRLoading(); // 로딩 제거 함수 호출
          qrContainer.innerHTML = "";
          qrContainer.appendChild(qr.element);

          const text = document.createElement("div");
          text.id = "qr-text";
          text.innerHTML = `
            <div style="font-size: 1.2rem; font-weight: 700; margin-bottom: 8px; color: #fff; text-shadow: 2px 2px 4px rgba(0,0,0,0.7);">
              💖 당신의 결과를 저장하세요 💖
            </div>
            <div style="font-size: 1.05rem; color: #ffe4e1; text-shadow: 1px 1px 2px rgba(0,0,0,0.55); font-weight: 700;">
              QR코드를 스캔하여<br>나만의 사진을 다운로드
            </div>
          `;
          qrContainer.appendChild(text);
        }).catch(err => {
          console.error("Firebase 업로드 실패:", err);
        });
      });
    }).catch(err => {
      console.error("html2canvas 실패:", err);
    });
  };

  if (img && img.complete) {
    startHtml2Canvas();
  } else if (img) {
    img.onload = startHtml2Canvas;
  } else {
    setTimeout(startHtml2Canvas, 300);
  }
}

function showQRLoading() {
  const qrContainer = document.getElementById("qrcode");
  qrContainer.innerHTML = `
    <div class="heart-loading"></div>
    <div id="qr-text">
      <div style="font-size: 1.1rem; font-weight: 600; color: #fff; text-shadow: 2px 2px 4px rgba(0,0,0,0.6); margin-bottom: 5px;">
        💖 마법의 QR코드 생성 중 💖
      </div>
      <div style="font-size: 0.8rem; color: #ffe4e1; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">
        잠시만 기다려주세요...
      </div>
    </div>
  `;
}
// <a href="https://pixabay.com/ko//?utm_source=link-attribution&utm_medium=referral&utm_campaign=animation&utm_content=7166">Pixabay</a>에서 <a href="https://pixabay.com/ko/users/u_u9abgwxlgv-38338414/?utm_source=link-attribution&utm_medium=referral&utm_campaign=animation&utm_content=7166">u_u9abgwxlgv</a>님이 제공한 GIF

function removeQRLoading() {
  const loadingElement = document.querySelector(".heart-loading");
  const text = document.getElementById("qr-text");
  if (loadingElement) loadingElement.remove();
  if (text) text.remove();
}

// 테스트용 QR코드 표시 함수
function showTestQR() {
  setTimeout(() => {
    const qrContainer = document.getElementById("qrcode");
    removeQRLoading();
    qrContainer.innerHTML = "";
    
    // 테스트용 QR코드 생성 (실제 URL 대신 테스트 메시지)
    const qr = new QRious({
      element: document.createElement("canvas"),
      value: "https://yeongwang-photo.web.app - 테스트 QR코드",
      size: 150 // 더 작은 크기로 조절
    });
    
    qrContainer.appendChild(qr.element);
    
    const text = document.createElement("div");
    text.id = "qr-text";
    text.style.position = "absolute";
    text.style.top = "100%";
    text.style.left = "50%";
    text.style.transform = "translateX(-50%)";
    text.style.marginTop = "10px";
    text.style.whiteSpace = "nowrap";
    text.style.textAlign = "center";
    text.innerHTML = `
      <div style="font-size: 0.8rem; font-weight: 700; margin-bottom: 4px; color: #fff; text-shadow: 2px 2px 4px rgba(0,0,0,0.7);">
        💖 테스트 QR코드 💖
      </div>
      <div style="font-size: 0.6rem; color: #ffe4e1; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">
        QR코드를 스캔하여 사진을 다운로드
      </div>
    `;
    qrContainer.appendChild(text);
  }, 2000); // 2초 후 테스트 QR코드 표시
}

function setEgenTetoResultFrame() {
  try {
    const scoreRaw = localStorage.getItem('tetoScore');
    const totalScore = scoreRaw ? parseInt(scoreRaw, 10) : 0;
    const egenCountRaw = localStorage.getItem('egenCount');
    const parsedEgen = egenCountRaw !== null ? parseInt(egenCountRaw, 10) : 0;
    const egenCount = Number.isNaN(parsedEgen) ? 0 : parsedEgen;
    const storedGender = localStorage.getItem('gender') || (localStorage.getItem('selectMen') ? 'male' : (localStorage.getItem('selectGirl') ? 'female' : 'female'));
    const isMale = storedGender === 'male';
    console.log('[RESULT] gender:', storedGender, 'egenCount:', egenCount, 'tetoScore:', totalScore);

    // 에겐 개수 기반 분기 (테토는 반대로 대응)
    const isEgen = egenCount >= 5; // 5개 이상이면 에겐 측 (완전 에겐이면 10)
    let tier = 3;
    let group = 'egen';
    if (isEgen) {
      // 에겐: 5~6=3, 7~8=2, 9~10=1
      if (egenCount >= 9) tier = 1;
      else if (egenCount >= 7) tier = 2;
      else tier = 3;
      group = 'egen';
    } else {
      // 테토: 10-egenCount 기준 반대로
      const tetoCount = 10 - egenCount;
      if (tetoCount >= 9) tier = 1;
      else if (tetoCount >= 7) tier = 2;
      else tier = 3;
      group = 'teto';
    }
    const genderSuffix = isMale ? 'man' : 'girl';
    const filename = `${group}${genderSuffix}${tier}.png`;
    const frameKey = `${group}${genderSuffix}${tier}`; // 예: egenman1

    // 프리셋(퍼센트) 적용 후, cover 보정 기반의 반응형(px) 재계산 적용
    // keep CSS-based #photo-box positioning

    const resultBg = document.getElementById('result-bg');
    if (resultBg) {
      resultBg.onload = () => { 
        console.log('[RESULT] frame:', filename); 
        // keep CSS-based #photo-box positioning
        initCameraAndCapture(); 
      };
      resultBg.src = `../images/${filename}`;
      resultBg.alt = filename;
      document.body.setAttribute('data-frame', frameKey);
    } else {
      // keep CSS-based #photo-box positioning
      initCameraAndCapture();
    }
  } catch (e) {
    // keep CSS-based #photo-box positioning
    initCameraAndCapture();
  }
}

window.onload = setEgenTetoResultFrame;