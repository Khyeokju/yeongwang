// QR 코드 업로드 활성화
firebase.initializeApp(window.__FIREBASE_CONFIG__);
const storage = firebase.storage();

// 프레임별 카메라 박스 위치/크기 프리셋 (필요 시 숫자만 조정)
const DEFAULT_PHOTO_BOX = { top: '18.7%', left: '35%', width: '30%', height: '36%' };
const PHOTO_BOX_PRESETS = {
  '010.png': { ...DEFAULT_PHOTO_BOX },
  '011.png': { ...DEFAULT_PHOTO_BOX },
  '012.png': { ...DEFAULT_PHOTO_BOX },
  '013.png': { ...DEFAULT_PHOTO_BOX },
  '014.png': { ...DEFAULT_PHOTO_BOX },
  '015.png': { ...DEFAULT_PHOTO_BOX },
  '016.png': { ...DEFAULT_PHOTO_BOX },
  '017.png': { ...DEFAULT_PHOTO_BOX },
  '018.png': { ...DEFAULT_PHOTO_BOX },
  '019.png': { ...DEFAULT_PHOTO_BOX },
  '020.png': { ...DEFAULT_PHOTO_BOX },
  '021.png': { ...DEFAULT_PHOTO_BOX }
};

function applyPhotoBoxPresetByFrame(frameFileName) {
  const preset = PHOTO_BOX_PRESETS[frameFileName] || DEFAULT_PHOTO_BOX;
  const box = document.getElementById('photo-box');
  if (!box) return;
  box.style.top = preset.top;
  box.style.left = preset.left;
  box.style.width = preset.width;
  box.style.height = preset.height;
}

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
    // 미러 미预览
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

        const fileName = `starresults/${Date.now()}.png`;
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
              ✨ 별자리 결과를 저장하세요 ✨
            </div>
            <div style=\"font-size: 0.9rem; color: #e8f4fd; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);\">\n              QR코드를 스캔하여<br>나만의 별자리 사진을 다운로드\n            </div>
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
    // 안전장치: 이미지 엘리먼트가 없을 경우 기존 방식 유지
    setTimeout(startHtml2Canvas, 300);
  }
}

function showQRLoading() {
  const qrContainer = document.getElementById("qrcode");
  qrContainer.innerHTML = `
    <div class="star-loading"></div>
    <div id="qr-text">
      <div style="font-size: 1.1rem; font-weight: 600; color: #fff; text-shadow: 2px 2px 4px rgba(0,0,0,0.6); margin-bottom: 5px;">
        ✨ 마법의 QR코드 생성 중 ✨
      </div>
      <div style="font-size: 0.8rem; color: #e8f4fd; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">
        잠시만 기다려주세요...
      </div>
    </div>
  `;
}

function removeQRLoading() {
  const loadingElement = document.querySelector(".star-loading");
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
      value: "https://yeongwang-photo.web.app - 별자리 테스트 QR코드",
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
        ✨ 테스트 QR코드 ✨
      </div>
      <div style="font-size: 0.6rem; color: #e8f4fd; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">
        QR코드를 스캔하여 별자리 사진을 다운로드
      </div>
    `;
    qrContainer.appendChild(text);
  }, 2000); // 2초 후 테스트 QR코드 표시
}

// 페이지 로드 시 별자리 결과 표시
window.onload = function() {
    displayStarResult();
};

// 별자리와 이미지 프레임 매핑
const constellationFrames = {
    '물병자리': '010.png',
    '물고기자리': '011.png',
    '양자리': '012.png',
    '황소자리': '013.png',
    '쌍둥이자리': '014.png',
    '게자리': '015.png',
    '사자자리': '016.png',
    '처녀자리': '017.png',
    '천칭자리': '018.png',
    '전갈자리': '019.png',
    '궁수자리': '020.png',
    '염소자리': '021.png'
};

// 별자리 결과 표시 및 프레임 설정
function displayStarResult() {
    const personality = localStorage.getItem('starPersonality') || '성격 특징을 불러올 수 없습니다.';
    const constellation = localStorage.getItem('starConstellation') || '물병자리';
    
    // 결과 배경 이미지를 별자리에 맞는 프레임으로 변경
    const resultBg = document.getElementById('result-bg');
    const frameImage = constellationFrames[constellation] || '010.png';

    // 프리셋 적용 (이미지 로딩 전에 위치 선적용)
    applyPhotoBoxPresetByFrame(frameImage);
    
    // 이미지 로딩 완료 후 카메라 초기화
    resultBg.onload = function() {
        console.log(`${constellation} 프레임 이미지 로딩 완료`);
        initCameraAndCapture();
    };
    
    resultBg.src = `../images/${frameImage}`;
    resultBg.alt = `${constellation} 프레임`;
    
    const descriptionBox = document.getElementById('description-box');
    descriptionBox.innerHTML = ``;
}