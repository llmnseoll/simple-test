class LottoBall extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return ['number'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'number' && oldValue !== newValue) {
            this.render();
        }
    }

    render() {
        const number = this.getAttribute('number') || '?';
        const color = this.getRandomColor();
        this.shadowRoot.innerHTML = `
            <style>
                .ball {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 24px;
                    color: white;
                    background-color: ${color};
                    box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
                }
            </style>
            <div class="ball">${number}</div>
        `;
    }

    getRandomColor() {
        const colors = [
            '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', 
            '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', 
            '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

customElements.define('lotto-ball', LottoBall);

document.getElementById('generate-btn').addEventListener('click', () => {
    const lottoNumbersContainer = document.getElementById('lotto-numbers');
    lottoNumbersContainer.innerHTML = '';
    
    // 로또 번호 생성 (중복 없이 6개)
    const numbers = new Set();
    while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    
    // 정렬해서 표시
    const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);
    
    sortedNumbers.forEach(number => {
        const lottoBall = document.createElement('lotto-ball');
        lottoBall.setAttribute('number', number);
        lottoNumbersContainer.appendChild(lottoBall);
    });
});
