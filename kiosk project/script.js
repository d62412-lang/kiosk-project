// 1. 상품 전체 데이터셋
const menuData = {
    Burgers: [
        { name: "클래식 버거", price: 5000, img: "🍔" },
        { name: "치즈 버거", price: 5500, img: "🧀" },
        { name: "베이컨 버거", price: 6000, img: "🥓" }
    ],
    Sides: [
        { name: "감자 튀김", price: 2000, img: "🍟" },
        { name: "치즈 스틱", price: 2500, img: "🧀" },
        { name: "어니언 링", price: 2800, img: "🧅" }
    ],
    Drinks: [
        { name: "콜라", price: 1500, img: "🥤" },
        { name: "사이다", price: 1500, img: "🥤" },
        { name: "오렌지 주스", price: 2000, img: "🧃" }
    ],
    Desserts: [
        { name: "바닐라 쉐이크", price: 3000, img: "🍦" },
        { name: "초코 선데이", price: 3500, img: "🍨" },
        { name: "애플 파이", price: 2200, img: "🥧" }
    ]
};

// 2. 글로벌 상태 변수 (State)
let currentCategory = "Burgers";
let cart = [];

// 3. DOM 요소 획득
const menuGrid = document.getElementById('menu-grid');
const cartList = document.getElementById('cart-list');
const totalPriceEl = document.getElementById('total-price');
const categoryItems = document.querySelectorAll('.category-item');
const btnSenior = document.getElementById('btn-senior');
const btnDark = document.getElementById('btn-dark');

// 결제 프로세스용 팝업(모달) 객체들
const paymentModal = document.getElementById('payment-modal');
const cardModal = document.getElementById('card-modal');
const cashModal = document.getElementById('cash-modal');

// 카드 관련 동적 조작 노드
const kioskCard = document.getElementById('kiosk-card');
const cardModalMsg = document.getElementById('card-modal-msg');
const btnInsertCard = document.getElementById('btn-insert-card');
const btnCancelCard = document.getElementById('btn-cancel-card');

// 4. 메뉴판 그리기 알고리즘
function renderMenu() {
    menuGrid.innerHTML = ''; 
    const items = menuData[currentCategory];
    items.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'menu-item';
        itemEl.innerHTML = `
            <div class="menu-img">${item.img}</div>
            <h3>${item.name}</h3>
            <p class="price">${item.price.toLocaleString()}원</p>
            <button class="add-to-cart-btn" onclick="addToCart('${item.name}', ${item.price})">담기</button>
        `;
        menuGrid.appendChild(itemEl);
    });
}

// 5. 장바구니 새로고침 알고리즘
function updateCartUI() {
    cartList.innerHTML = '';
    if (cart.length === 0) {
        cartList.innerHTML = '<p class="empty-msg">장바구니가 비어 있습니다.</p>';
        totalPriceEl.innerText = '0원';
        return;
    }

    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <div>
                <h4>${item.name}</h4>
                <small>${(item.price * item.quantity).toLocaleString()}원</small>
            </div>
            <div class="quantity-controls">
                <button onclick="changeQuantity('${item.name}', -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="changeQuantity('${item.name}', 1)">+</button>
            </div>
        `;
        cartList.appendChild(itemEl);
    });
    totalPriceEl.innerText = total.toLocaleString() + '원';
}

// 6. 물품 담기 및 수량 제어 모듈
window.addToCart = function(name, price) {
    const existItem = cart.find(item => item.name === name);
    if (existItem) { existItem.quantity += 1; } 
    else { cart.push({ name, price, quantity: 1 }); }
    updateCartUI();
};

window.changeQuantity = function(name, change) {
    const item = cart.find(i => i.name === name);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) { cart = cart.filter(i => i.name !== name); }
    }
    updateCartUI();
};

// 7. 카테고리 탭 클릭 리스너 바인딩
categoryItems.forEach(item => {
    item.addEventListener('click', (e) => {
        categoryItems.forEach(i => i.classList.remove('active'));
        e.target.classList.add('active');
        currentCategory = e.target.getAttribute('data-category');
        renderMenu();
    });
});

// 8. 테마 체인저 (고령자/다크모드)
btnSenior.addEventListener('click', () => {
    document.body.classList.toggle('senior-mode');
    btnSenior.innerText = document.body.classList.contains('senior-mode') ? "일반 모드로 복귀" : "고령자 모드 켜기";
});

btnDark.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    btnDark.innerText = document.body.classList.contains('dark-mode') ? "라이트모드 켜기" : "다크모드 켜기";
});

// 9. [주문하기] 메인 제어문
document.getElementById('btn-checkout').addEventListener('click', () => {
    if (cart.length === 0) { alert('장바구니가 비어 있습니다!'); } 
    else { paymentModal.style.display = 'flex'; }
});

// 공통 모달 닫기 유틸 함수
window.closeModal = function(modalId) {
    document.getElementById(modalId).style.display = 'none';
};

// 10. [결제 수단 선택창] 분기점 제어 함수
window.selectPaymentMethod = function(method) {
    paymentModal.style.display = 'none'; // 1단계 메인 팝업 끄기
    
    if (method === '카드') {
        // 카드 연습 모달 리셋 및 오픈
        kioskCard.classList.remove('inserted');
        cardModalMsg.innerHTML = "아래 그림을 보고 카드를 투입구에 끝까지 넣어주세요!";
        btnInsertCard.style.display = "block";
        btnCancelCard.style.display = "block";
        cardModal.style.display = 'flex';
    } else if (method === '현금') {
        // 현금 모달 오픈
        cashModal.style.display = 'flex';
    }
};

// 11. 연습용 카드 결제 핵심 로직 (애니메이션 및 가상 타임 딜레이 처리)
window.processCardPayment = function() {
    // A. 카드 투입 애니메이션 클래스 작동 시작
    kioskCard.classList.add('inserted');
    btnInsertCard.style.display = "none"; // 연속 클릭 방지용 숨김 처리
    btnCancelCard.style.display = "none"; // 결제 도중 취소 방지

    // B. IC칩 인식 시간 차 시뮬레이션 가동 (2초 소요 딜레이)
    cardModalMsg.innerHTML = "⏳ <strong>IC칩 인식 중... 잠시만 기다려주세요.</strong>";
    
    setTimeout(() => {
        // 2초 뒤 최종 결제 완료 콜백 실행
        alert('💳 신용카드 결제가 정상 완료되었습니다! 주문서가 발급됩니다.');
        
        // 데이터 전면 청소 및 UI 복원
        cart = [];
        updateCartUI();
        cardModal.style.display = 'none';
    }, 2000);
};

// 12. 현금 결제 카운터 이동 완료 처리
window.confirmCashPayment = function() {
    alert('카운터 전송용 가상 주문 접수가 처리되었습니다. 카운터로 가셔서 마저 결제해 주세요!');
    cart = [];
    updateCartUI();
    cashModal.style.display = 'none';
};

// 최초 어플리케이션 구동
renderMenu();
