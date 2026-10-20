/**
 * ============================================================================
 * THIỆP CHÚC MỪNG 20/10 - LOGIC JAVASCRIPT
 * Tương tác Hộp Quà 3D, Mưa hoa hồng & Pháo hoa Canvas, Hiệu ứng Typing,
 * Rút Lời Chúc May Mắn Ngẫu Nhiên và Tổng hợp Âm Thanh Web Audio API.
 * ============================================================================
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. TỔNG HỢP ÂM THANH BẰNG WEB AUDIO API (Hoàn toàn độc lập, không lỗi link)
     ========================================================================== */
  class SoundManager {
    constructor() {
      this.enabled = true;
      this.ctx = null;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      return this.enabled;
    }

    // Âm thanh mở quà: Hợp âm đàn Harp diệu kỳ (Arpeggio lấp lánh)
    playOpenFanfare() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C, E, G, C, E, G, C cao
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.08 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 1.3);
      });
    }

    // Âm thanh gõ máy chữ/bút viết êm dịu (Soft typewriter tap)
    playTypeSound() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      // Thay đổi tần số ngẫu nhiên nhẹ nhàng để nghe tự nhiên
      osc.frequency.setValueAtTime(500 + Math.random() * 250, now);

      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    }

    // Âm thanh chuông may mắn khi rút lời chúc (Sweet Magic Chime)
    playLuckyChime() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const freqs = [523.25, 659.25, 783.99, 1046.50];
      const now = this.ctx.currentTime;

      freqs.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);

        gain.gain.setValueAtTime(0.001, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.18, now + i * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.9);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 1.0);
      });
    }

    // Âm thanh click nhẹ khi tương tác nút
    playPop() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    }
  }

  const sound = new SoundManager();

  /* ==========================================================================
     2. HỆ THỐNG MƯA HOA HỒNG, TRÁI TIM & PHÁO HOA CANVAS (60 FPS)
     ========================================================================== */
  class ParticleEngine {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.active = true;
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.loop();
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width * window.devicePixelRatio;
      this.canvas.height = this.height * window.devicePixelRatio;
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    // Tạo cánh hoa hồng rơi
    createPetal(startY = -20) {
      const colors = [
        { r: 255, g: 105, b: 145 }, // Hồng cánh sen
        { r: 255, g: 154, b: 162 }, // Hồng phấn
        { r: 224, g: 36, b: 100 },  // Đỏ hoa hồng
        { r: 255, g: 183, b: 178 }, // San hô ấm
        { r: 247, g: 143, b: 179 }  // Hồng đào
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];

      return {
        type: 'petal',
        x: Math.random() * this.width,
        y: startY,
        size: 10 + Math.random() * 14,
        color: color,
        speedY: 1.2 + Math.random() * 2.2,
        speedX: (Math.random() - 0.5) * 1.5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.04,
        flip: Math.random() * Math.PI,
        flipSpeed: 0.02 + Math.random() * 0.03,
        opacity: 0.7 + Math.random() * 0.3,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.03 + Math.random() * 0.02
      };
    }

    // Tạo trái tim bay
    createHeart(x, y, burst = false) {
      const colors = ['#ff5d8f', '#ff3370', '#e02464', '#ff85a1', '#f5b041'];
      const angle = burst ? Math.random() * Math.PI * 2 : -Math.PI / 2 + (Math.random() - 0.5);
      const speed = burst ? 2 + Math.random() * 6 : 1 + Math.random() * 2;

      return {
        type: 'heart',
        x: x || Math.random() * this.width,
        y: y || this.height + 20,
        size: 12 + Math.random() * 16,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: burst ? 0.06 : -0.02,
        alpha: 1,
        fadeSpeed: burst ? 0.012 + Math.random() * 0.01 : 0.005,
        scale: 1,
        scaleSpeed: burst ? -0.01 : 0
      };
    }

    // Tạo tia sáng pháo hoa nở rộ (Celebration Sparkle)
    createSparkle(x, y) {
      const colors = ['#ffd700', '#ff69b4', '#ff1493', '#00ffff', '#ffffff', '#ffb6c1'];
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 7;

      return {
        type: 'sparkle',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.12,
        friction: 0.96,
        size: 2.5 + Math.random() * 3.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        fadeSpeed: 0.018 + Math.random() * 0.02
      };
    }

    // Vụ nổ lớn chúc mừng khi mở quà (Explosion Celebration)
    explode(originX, originY) {
      const x = originX || this.width / 2;
      const y = originY || this.height / 2;

      // 60 tia pháo hoa
      for (let i = 0; i < 70; i++) {
        this.particles.push(this.createSparkle(x, y));
      }
      // 35 trái tim bay tứ phía
      for (let i = 0; i < 35; i++) {
        this.particles.push(this.createHeart(x, y, true));
      }
      // 40 cánh hoa bung tỏa
      for (let i = 0; i < 45; i++) {
        const p = this.createPetal(y);
        p.x = x + (Math.random() - 0.5) * 120;
        p.speedX = (Math.random() - 0.5) * 8;
        p.speedY = -4 + Math.random() * 8;
        this.particles.push(p);
      }
    }

    // Bắt đầu mưa hoa liên tục với mật độ tinh tế
    startContinuousShower() {
      this.isContinuous = true;
    }

    update() {
      // Bổ sung hạt rơi nếu đang ở chế độ mưa hoa
      if (this.isContinuous && this.particles.filter(p => p.type === 'petal').length < 40) {
        if (Math.random() < 0.3) {
          this.particles.push(this.createPetal(-25));
        }
        if (Math.random() < 0.08) {
          this.particles.push(this.createHeart());
        }
      }

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];

        if (p.type === 'petal') {
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(p.wobble) * 0.8;
          p.wobble += p.wobbleSpeed;
          p.rotation += p.rotationSpeed;
          p.flip += p.flipSpeed;

          // Hủy khi rơi quá màn hình
          if (p.y > this.height + 30) {
            this.particles.splice(i, 1);
          }
        } else if (p.type === 'sparkle') {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity;
          p.vx *= p.friction;
          p.vy *= p.friction;
          p.alpha -= p.fadeSpeed;

          if (p.alpha <= 0) {
            this.particles.splice(i, 1);
          }
        } else if (p.type === 'heart') {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity;
          p.alpha -= p.fadeSpeed;
          if (p.scaleSpeed) p.size = Math.max(0, p.size + p.scaleSpeed);

          if (p.alpha <= 0 || p.y < -30) {
            this.particles.splice(i, 1);
          }
        }
      }
    }

    draw() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      for (const p of this.particles) {
        if (p.type === 'petal') {
          this.ctx.save();
          this.ctx.translate(p.x, p.y);
          this.ctx.rotate(p.rotation);
          this.ctx.scale(Math.sin(p.flip), 1);

          this.ctx.beginPath();
          // Vẽ hình cánh hoa hồng cong mềm mại
          this.ctx.moveTo(0, -p.size);
          this.ctx.bezierCurveTo(p.size * 0.7, -p.size, p.size * 0.9, p.size * 0.4, 0, p.size);
          this.ctx.bezierCurveTo(-p.size * 0.9, p.size * 0.4, -p.size * 0.7, -p.size, 0, -p.size);

          this.ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.opacity})`;
          this.ctx.shadowColor = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0.3)`;
          this.ctx.shadowBlur = 4;
          this.ctx.fill();
          this.ctx.restore();
        } else if (p.type === 'sparkle') {
          this.ctx.save();
          this.ctx.globalAlpha = Math.max(0, p.alpha);
          this.ctx.fillStyle = p.color;
          this.ctx.shadowColor = p.color;
          this.ctx.shadowBlur = 8;
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.restore();
        } else if (p.type === 'heart') {
          this.ctx.save();
          this.ctx.globalAlpha = Math.max(0, p.alpha);
          this.ctx.fillStyle = p.color;
          this.ctx.translate(p.x, p.y);

          const s = p.size / 20;
          this.ctx.beginPath();
          this.ctx.moveTo(0, 0);
          this.ctx.bezierCurveTo(-10 * s, -12 * s, -20 * s, 4 * s, 0, 18 * s);
          this.ctx.bezierCurveTo(20 * s, 4 * s, 10 * s, -12 * s, 0, 0);
          this.ctx.fill();
          this.ctx.restore();
        }
      }
    }

    loop() {
      this.update();
      this.draw();
      requestAnimationFrame(() => this.loop());
    }

    clear() {
      this.particles = [];
      this.isContinuous = false;
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }

  const particles = new ParticleEngine('celebration-canvas');

  /* ==========================================================================
     3. KHO DỮ LIỆU LỜI CHÚC 20/10 MAY MẮN & Ý NGHĨA
     ========================================================================== */
  const WISHES_DATABASE = [
    {
      category: 'Lời chúc Hạnh Phúc',
      symbol: '🌸',
      title: 'Đóa Hoa Rạng Rỡ Ban Mai',
      quote: 'Chúc bạn có một ngày 20/10 ngập tràn nụ cười, ngập tràn quà tặng và trọn vẹn yêu thương. Mong bạn mỗi ngày thức giấc đều tìm thấy niềm vui, mỗi bước chân đều gặp điều dịu dàng và luôn được trân quý như đóa hoa đẹp nhất!',
      tip: 'Vũ trụ nhắn gửi: Hãy nở nụ cười thật tươi, vì khi bạn cười, cả thế giới xung quanh bỗng chốc sáng bừng!'
    },
    {
      category: 'Lời chúc Nhan Sắc & Trẻ Trung',
      symbol: '🌷',
      title: 'Vẻ Đẹp Vượt Thời Gian',
      quote: 'Chúc bạn tuổi mới xinh đẹp như hoa tulip, trẻ trung như ánh bình minh và duyên dáng như làn gió mùa thu. Nhan sắc là món quà, còn sự tự tin và lương thiện chính là hào quang vĩnh cửu của bạn!',
      tip: 'Vũ trụ nhắn gửi: Bạn sinh ra đã là một bản thể tuyệt mỹ, hãy luôn yêu lấy từng đường nét của chính mình!'
    },
    {
      category: 'Lời chúc Thành Công & Tự Tin',
      symbol: '👑',
      title: 'Nữ Hoàng Của Cuộc Đời Mình',
      quote: 'Chúc bạn luôn kiên định với ước mơ, tự tin trên con đường mình chọn và gặt hái thật nhiều thành tựu rực rỡ. Hãy nhớ rằng không ai có thể giới hạn bầu trời mà bạn có thể vươn tới!',
      tip: 'Vũ trụ nhắn gửi: Bạn có đầy đủ tài năng, sự dũng cảm và nội lực để chinh phục mọi đỉnh cao bạn hằng mong ước.'
    },
    {
      category: 'Lời chúc Tình Yêu & Ấm Áp',
      symbol: '💖',
      title: 'Ngọt Ngào & Bình Yên',
      quote: 'Chúc bạn tìm thấy một tình yêu chân thành, nơi bạn luôn được lắng nghe, nâng niu và thấu hiểu. Mong rằng trong mọi hoàn cảnh, luôn có một bờ vai ấm áp làm điểm tựa bình yên cho bạn!',
      tip: 'Vũ trụ nhắn gửi: Người xứng đáng với bạn sẽ yêu cả những lúc bạn rực rỡ lẫn những phút giây yếu mềm.'
    },
    {
      category: 'Lời chúc Dành Cho Mẹ Yêu',
      symbol: '🌺',
      title: 'Suối Nguồn Bình Yên Của Con',
      quote: 'Kính chúc Mẹ ngày 20/10 dồi dào sức khỏe, an vui và hạnh phúc. Cảm ơn Mẹ đã luôn hy sinh, vun vén cho gia đình bằng tất cả tình thương bao la. Con yêu Mẹ nhiều hơn mọi lời nói trên thế gian!',
      tip: 'Vũ trụ nhắn gửi: Nụ cười bình an của Mẹ chính là phước lành lớn nhất của cả gia đình.'
    },
    {
      category: 'Lời chúc Sức Khỏe & An Nhiên',
      symbol: '🍀',
      title: 'Vạn Sự Như Ý, Thân Tâm An Lành',
      quote: 'Chúc bạn 365 ngày trôi qua với một cơ thể khỏe mạnh, một tâm hồn thảnh thơi và một trái tim ấm áp. Mong mọi mỏi mệt đều tan biến, chỉ còn lại sự an yên và may mắn gõ cửa!',
      tip: 'Vũ trụ nhắn gửi: Hãy dành thời gian nghỉ ngơi, chăm sóc bản thân nhiều hơn mỗi ngày bạn nhé!'
    },
    {
      category: 'Lời chúc Đồng Nghiệp & Bạn Bè',
      symbol: '✨',
      title: 'Người Đồng Hành Tuyệt Vời',
      quote: 'Chúc bạn ngày 20/10 nhận được thật nhiều hoa, nhiều lời khen và những bất ngờ ngọt ngào. Cảm ơn bạn vì luôn đem đến năng lượng tích cực, sự hóm hỉnh và sự thông minh làm rạng rỡ không gian chung!',
      tip: 'Vũ trụ nhắn gửi: Năng lượng tươi sáng của bạn là nguồn cảm hứng lan tỏa đến rất nhiều người xung quanh.'
    },
    {
      category: 'Lời chúc Tri Thức & Sáng Tạo',
      symbol: '📖',
      title: 'Tâm Hồn Sâu Sắc & Thơ Mộng',
      quote: 'Chúc bạn luôn giữ được sự tinh tế trong cảm xúc, sự sắc sảo trong trí tuệ và sự bay bổng trong tâm hồn. Mong bạn đọc được những cuốn sách hay, ngắm những khung trời đẹp và sống một cuộc đời đầy thơ!',
      tip: 'Vũ trụ nhắn gửi: Thế giới nội tâm phong phú chính là kho báu quý giá nhất mà bạn đang sở hữu.'
    },
    {
      category: 'Lời chúc Độc Lập & Kiên Cường',
      symbol: '🌻',
      title: 'Đóa Hướng Dương Kiêu Hãnh',
      quote: 'Chúc bạn luôn hướng về phía mặt trời như loài hoa hướng dương kiêu hãnh. Bất kể giông bão hay thử thách, mong bạn luôn đứng vững, mỉm cười và tỏa sáng rực rỡ với khí chất riêng!',
      tip: 'Vũ trụ nhắn gửi: Bạn mạnh mẽ hơn bạn nghĩ và dịu dàng hơn bạn tưởng.'
    },
    {
      category: 'Lời chúc May Mắn & Tài Lộc',
      symbol: '💎',
      title: 'Tiền Đầy Túi, Tình Đầy Tim',
      quote: 'Chúc bạn ngày 20/10 tài lộc thăng hoa, công việc suôn sẻ, ví tiền rủng rỉnh và túi xách luôn có thỏi son yêu thích. Chúc bạn làm điều mình thích và thích điều mình làm!',
      tip: 'Vũ trụ nhắn gửi: Mọi hạt mầm nỗ lực bạn gieo trồng hôm nay đều sẽ nở thành hoa trái ngọt ngào ngày mai.'
    }
  ];

  /* ==========================================================================
     4. NỘI DUNG LÁ THƯ CHÚC MỪNG VÀ BỘ MÁY GÕ CHỮ (TYPING EFFECT)
     ========================================================================== */
  const LETTER_CONTENT = `Gửi những người phụ nữ tuyệt vời nhất,

Nhân ngày Phụ nữ Việt Nam 20/10, xin gửi trọn vẹn những tình cảm ấm áp, lòng biết ơn và sự ngưỡng mộ chân thành nhất đến bạn.

Chúc bạn luôn giữ mãi nụ cười rạng rỡ như đóa hoa sớm mai, tâm hồn bình yên và trái tim ngập tràn hạnh phúc. Dù ở bất kỳ cương vị nào — người mẹ tần tảo, người chị dịu dàng, người em đáng yêu hay người phụ nữ kiên cường theo đuổi đam mê — bạn đều là một kiệt tác vô giá của thế giới này!

Hãy luôn yêu thương chính mình, tự tin tỏa sáng rực rỡ và đón nhận thật nhiều điều may mắn, ngọt ngào không chỉ riêng hôm nay mà trong suốt 365 ngày của năm! ✨🌸💖`;

  class Typewriter {
    constructor(elementId, cursorId, text) {
      this.el = document.getElementById(elementId);
      this.cursor = document.getElementById(cursorId);
      this.text = text;
      this.charIndex = 0;
      this.isTyping = false;
      this.timer = null;
    }

    start(onComplete) {
      this.el.innerHTML = '';
      this.charIndex = 0;
      this.isTyping = true;
      if (this.cursor) this.cursor.classList.remove('hide');

      const typeNextChar = () => {
        if (!this.isTyping) return;

        if (this.charIndex < this.text.length) {
          const char = this.text.charAt(this.charIndex);

          // Phát âm thanh gõ nhẹ (cứ mỗi 2 ký tự hoặc ký tự đầu)
          if (this.charIndex % 3 === 0 && char !== ' ' && char !== '\n') {
            sound.playTypeSound();
          }

          // Xử lý xuống dòng mượt mà
          if (char === '\n') {
            this.el.innerHTML += '<br>';
          } else {
            this.el.innerHTML += char;
          }

          this.charIndex++;

          // Tốc độ gõ tự nhiên: nghỉ lâu hơn ở dấu chấm và dấu phẩy
          let delay = 32;
          if (char === '.' || char === '!' || char === '?') {
            delay = 320;
          } else if (char === ',' || char === '—') {
            delay = 140;
          } else if (char === '\n') {
            delay = 200;
          } else {
            delay = 28 + Math.random() * 25;
          }

          this.timer = setTimeout(typeNextChar, delay);
        } else {
          this.isTyping = false;
          if (onComplete) onComplete();
        }
      };

      typeNextChar();
    }

    skip() {
      if (this.timer) clearTimeout(this.timer);
      this.isTyping = false;
      // Chuyển ký tự xuống dòng thành thẻ <br>
      this.el.innerHTML = this.text.replace(/\n/g, '<br>');
      if (this.cursor) this.cursor.classList.add('hide');
    }

    reset() {
      if (this.timer) clearTimeout(this.timer);
      this.isTyping = false;
      this.charIndex = 0;
      this.el.innerHTML = '';
      if (this.cursor) this.cursor.classList.remove('hide');
    }
  }

  const typewriter = new Typewriter('typed-text', 'typing-cursor', LETTER_CONTENT);

  /* ==========================================================================
     5. ĐIỀU KHIỂN GIAO DIỆN & TƯƠNG TÁC NGƯỜI DÙNG (DOM CONTROLLER)
     ========================================================================== */
  const giftBoxWrapper = document.getElementById('gift-box-wrapper');
  const giftScene = document.getElementById('gift-scene');
  const cardScene = document.getElementById('card-scene');
  const replayBtn = document.getElementById('replay-btn');
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const soundIcon = document.getElementById('sound-icon');
  const soundLabel = document.getElementById('sound-label');
  const skipTypingBtn = document.getElementById('skip-typing-btn');
  const drawWishBtn = document.getElementById('draw-wish-btn');

  // Modal elements
  const wishModal = document.getElementById('wish-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalWishSymbol = document.getElementById('modal-wish-symbol');
  const modalWishCategory = document.getElementById('modal-wish-category');
  const modalWishTitle = document.getElementById('modal-wish-title');
  const modalWishContent = document.getElementById('modal-wish-content');
  const modalWishTip = document.getElementById('modal-wish-tip');
  const shuffleWishBtn = document.getElementById('shuffle-wish-btn');
  const copyWishBtn = document.getElementById('copy-wish-btn');

  // Toast
  const toastNotification = document.getElementById('toast-notification');
  const toastMessage = document.getElementById('toast-message');

  let currentWishIndex = -1;
  let toastTimer = null;

  // Hiển thị ngày tháng hiện tại (hoặc ngày 20/10)
  const dateTextEl = document.getElementById('current-date-text');
  if (dateTextEl) {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    dateTextEl.textContent = `Ngày ${day} Tháng ${month}, Năm ${year}`;
  }

  /* --- Xử lý Mở Hộp Quà --- */
  function openGiftBox() {
    if (giftBoxWrapper.classList.contains('opening')) return;

    sound.init();
    giftBoxWrapper.classList.add('opening');
    sound.playOpenFanfare();

    // Lấy vị trí hộp quà để bắn pháo hoa từ tâm
    const rect = giftBoxWrapper.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Kích hoạt pháo hoa bùng nổ
    particles.explode(centerX, centerY);

    // Sau khi mở nắp, chuyển màn hình sang Lá Thư Chúc Mừng
    setTimeout(() => {
      giftScene.classList.add('hidden');
      cardScene.classList.remove('hidden');
      replayBtn.classList.remove('hidden');

      // Khởi động mưa hoa hồng liên tục khắp màn hình
      particles.startContinuousShower();

      // Bắt đầu hiệu ứng gõ lá thư
      typewriter.start();
    }, 850);
  }

  giftBoxWrapper.addEventListener('click', openGiftBox);
  giftBoxWrapper.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openGiftBox();
    }
  });

  /* --- Bỏ qua gõ chữ để đọc ngay --- */
  skipTypingBtn.addEventListener('click', () => {
    sound.playPop();
    typewriter.skip();
  });

  /* --- Nút Mở lại Hộp Quà (Replay) --- */
  replayBtn.addEventListener('click', () => {
    sound.playPop();
    typewriter.reset();
    particles.clear();

    giftBoxWrapper.classList.remove('opening');
    cardScene.classList.add('hidden');
    giftScene.classList.remove('hidden');
    replayBtn.classList.add('hidden');

    // Cuộn mượt lên đầu trang
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* --- Bật/Tắt Âm Thanh --- */
  soundToggleBtn.addEventListener('click', () => {
    const isEnabled = sound.toggle();
    if (isEnabled) {
      soundIcon.textContent = '🔔';
      soundLabel.textContent = 'Âm thanh: Bật';
      sound.playPop();
    } else {
      soundIcon.textContent = '🔕';
      soundLabel.textContent = 'Âm thanh: Tắt';
    }
  });

  /* ==========================================================================
     6. HỆ THỐNG RÚT LỜI CHÚC MAY MẮN NGẪU NHIÊN
     ========================================================================== */
  function getRandomWish() {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * WISHES_DATABASE.length);
    } while (nextIndex === currentWishIndex && WISHES_DATABASE.length > 1);

    currentWishIndex = nextIndex;
    return WISHES_DATABASE[nextIndex];
  }

  function displayWishInModal(wish, animate = true) {
    const quoteBox = document.querySelector('.wish-quote-box');

    const updateContent = () => {
      modalWishSymbol.textContent = wish.symbol;
      modalWishCategory.textContent = wish.category;
      modalWishTitle.textContent = wish.title;
      modalWishContent.textContent = wish.quote;
      modalWishTip.innerHTML = `💡 <em>${wish.tip}</em>`;
    };

    if (animate && quoteBox) {
      quoteBox.classList.add('fade-transition');
      setTimeout(() => {
        updateContent();
        quoteBox.classList.remove('fade-transition');
      }, 200);
    } else {
      updateContent();
    }
  }

  function showWishModal() {
    const wish = getRandomWish();
    displayWishInModal(wish, false);

    wishModal.classList.remove('hidden');
    sound.playLuckyChime();

    // Bắn thêm một chùm tia sáng nhỏ lấp lánh khi mở quẻ
    const rect = drawWishBtn.getBoundingClientRect();
    particles.explode(rect.left + rect.width / 2, rect.top);
  }

  function closeWishModal() {
    sound.playPop();
    wishModal.classList.add('hidden');
  }

  drawWishBtn.addEventListener('click', showWishModal);
  modalCloseBtn.addEventListener('click', closeWishModal);

  // Đóng modal khi bấm ra ngoài vùng viền card
  wishModal.addEventListener('click', (e) => {
    if (e.target === wishModal) {
      closeWishModal();
    }
  });

  // Đóng modal bằng phím ESC
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !wishModal.classList.contains('hidden')) {
      closeWishModal();
    }
  });

  // Rút lời chúc khác
  shuffleWishBtn.addEventListener('click', () => {
    sound.playLuckyChime();
    const wish = getRandomWish();
    displayWishInModal(wish, true);
  });

  // Sao chép lời chúc vào Clipboard
  copyWishBtn.addEventListener('click', () => {
    sound.playPop();
    const wish = WISHES_DATABASE[currentWishIndex];
    if (!wish) return;

    const copyText = `🌸 [Thiệp 20/10] ${wish.title} 🌸\n\n"${wish.quote}"\n\n✨ Chúc bạn một ngày 20/10 thật hạnh phúc và tỏa sáng! ✨`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(copyText).then(() => {
        showToast('Đã sao chép lời chúc vào khay nhớ tạm! 💖');
      }).catch(() => {
        fallbackCopyText(copyText);
      });
    } else {
      fallbackCopyText(copyText);
    }
  });

  function fallbackCopyText(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast('Đã sao chép lời chúc vào khay nhớ tạm! 💖');
    } catch (err) {
      showToast('Không thể tự động sao chép, bạn hãy bôi đen và copy nhé!');
    }
    document.body.removeChild(textarea);
  }

  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastMessage.textContent = msg;
    toastNotification.classList.remove('hidden');

    toastTimer = setTimeout(() => {
      toastNotification.classList.add('hidden');
    }, 2800);
  }

  /* ==========================================================================
     7. VẾT SAO LẤP LÁNH KHI DI CHUỘT / CHẠM MÀN HÌNH (CURSOR SPARKLES)
     ========================================================================== */
  const trailLayer = document.getElementById('cursor-trail-layer');
  let lastTrailTime = 0;

  function spawnCursorSparkle(x, y) {
    const now = Date.now();
    if (now - lastTrailTime < 50) return; // Giới hạn tần suất để mượt mà
    lastTrailTime = now;

    const sparkle = document.createElement('div');
    sparkle.className = 'cursor-sparkle';

    const colors = ['#ff5d8f', '#ffd54f', '#ff85a1', '#e040fb', '#ffffff'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 6 + Math.random() * 8;

    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;
    sparkle.style.backgroundColor = color;
    sparkle.style.color = color;

    trailLayer.appendChild(sparkle);

    setTimeout(() => {
      if (sparkle.parentNode) {
        sparkle.parentNode.removeChild(sparkle);
      }
    }, 750);
  }

  window.addEventListener('mousemove', (e) => {
    spawnCursorSparkle(e.clientX, e.clientY);
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      spawnCursorSparkle(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

})();
