// 테스트 중이므로 Firebase 업로드 비활성화
// firebase.initializeApp(window.__FIREBASE_CONFIG__);
// const storage = firebase.storage();

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

        // QR코드 영역 초기화 및 안내문구 제거
        const qrContainer = document.getElementById("qrcode");
        qrContainer.innerHTML = "";
        qrContainer.classList.add("qr-active"); // 안내문구 숨기는 클래스 추가

        console.log("전체 프레임 업로드 시작");
        showQRLoading(); // 로딩 표시 함수 호출
        // 테스트 중이므로 Firebase 업로드 비활성화
        // captureFullFrameAndUpload();
        showTestQR(); // 테스트용 QR코드 표시
      }
    }, 2000);
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
            size: 220
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
            <div style="font-size: 0.9rem; color: #ffe4e1; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">
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

window.onload = initCameraAndCapture;