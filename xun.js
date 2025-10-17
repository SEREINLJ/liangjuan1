    // 游戏状态管理
    const gameState = {
      library: { completed: false, steps: 0 },
      temple: { completed: false, steps: 0 },
      treasure: { completed: false, steps: 0 },
      currentStep: 0
    };
    
    // 背景音乐
    const backgroundMusic = new Audio('final.mp3');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.3;
    
    // 页面元素
    const mainPage = document.getElementById('main-page');
    const libraryPage = document.getElementById('library-page');
    const templePage = document.getElementById('temple-page');
    const treasurePage = document.getElementById('treasure-page');
    
    // 背景图片
    libraryPage.style.backgroundImage = "url('1.jpg')";
    templePage.style.backgroundImage = "url('2.jpg')";
    treasurePage.style.backgroundImage = "url('3.jpg')";
    
    // 从本地存储加载游戏状态
    function loadGameState() {
      const savedState = localStorage.getItem('treasureGameState');
      if (savedState) {
        Object.assign(gameState, JSON.parse(savedState));
        updateProgress();
      }
    }
    
    // 保存游戏状态到本地存储
    function saveGameState() {
      localStorage.setItem('treasureGameState', JSON.stringify(gameState));
      updateProgress();
    }
    
    // 重置游戏状态
    function resetGameState() {
      gameState.library.completed = false;
      gameState.library.steps = 0;
      gameState.temple.completed = false;
      gameState.temple.steps = 0;
      gameState.treasure.completed = false;
      gameState.treasure.steps = 0;
      gameState.currentStep = 0;
      saveGameState();
      
      // 清除日志
      document.querySelectorAll('#treasure-log, #temple-log, #treasure-log-final').forEach(log => {
        log.innerHTML = '';
      });
      
      alert('游戏进度已重置！');
    }
    
    // 更新进度条
    function updateProgress() {
      const totalSteps = 3; // 三个地点
      const completedSteps = 
        (gameState.library.completed ? 1 : 0) + 
        (gameState.temple.completed ? 1 : 0) + 
        (gameState.treasure.completed ? 1 : 0);
      
      const progressPercentage = Math.round((completedSteps / totalSteps) * 100);
      document.getElementById('progress-bar').style.width = `${progressPercentage}%`;
      document.getElementById('progress-text').textContent = `${progressPercentage}%`;
    }
    
    // 显示步骤动画
    function showStep(logElement, msg, type) {
      const div = document.createElement('div');
      div.className = 'step' + (type ? ' ' + type : '');
      div.textContent = msg;
      logElement.appendChild(div);
      setTimeout(() => div.classList.add('visible'), 100);
      logElement.scrollTop = logElement.scrollHeight;
      return div;
    }
    
    // 谜题
    const riddles = [
      { q: '什么东西越洗越脏？（答案为一个字）', a: '水' },
    ];
    
    // 询问谜题
    function askRiddleOnce(logElement) {
      return new Promise((resolve) => {
        const idx = Math.floor(Math.random() * riddles.length);
        const riddle = riddles[idx];
        const div = showStep(logElement, '线索谜题：' + riddle.q, 'info');
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = '请输入答案';
        input.style.margin = '10px';
        input.style.fontSize = '1em';
        input.style.padding = '5px';
        input.style.width = '200px';
        
        const btn = document.createElement('button');
        btn.textContent = '提交';
        btn.className = 'btn';
        btn.style.marginLeft = '10px';
        
        div.appendChild(document.createElement('br'));
        div.appendChild(input);
        div.appendChild(btn);
        input.focus();
        
        btn.onclick = () => {
          const userInput = input.value.trim();
          if (userInput) {
            input.disabled = true;
            btn.disabled = true;
            
            if (userInput === riddle.a) {
              showStep(logElement, '回答正确！谜题已解开。', 'success');
              resolve(true);
            } else {
              showStep(logElement, '回答错误！请再试一次。', 'fail');
              // 清除输入，允许再次尝试
              input.value = '';
              input.disabled = false;
              btn.disabled = false;
              input.focus();
            }
          }
        };
        
        input.addEventListener('keydown', e => {
          if (e.key === 'Enter') btn.onclick();
        });
      });
    }
    
    // 模拟异步操作的函数
    const TreasureMap = {
      getInitialClue: () => new Promise(resolve => {
        setTimeout(() => {
          resolve('在古老的书架上，你发现了一本泛黄的古籍，上面记载着神庙的秘密入口...');
        }, 1500);
      }),
      
      solveRiddle: () => new Promise(resolve => {
        setTimeout(() => {
          resolve({ success: true, message: '谜题已解开，你获得了通往神庙的钥匙！' });
        }, 1000);
      }),
      
      decodeAncientScript: () => new Promise(resolve => {
        setTimeout(() => {
          resolve('通过解码古籍，你发现神庙入口位于东侧石柱后面...');
        }, 1500);
      }),
      
      meetNPC: () => new Promise(resolve => {
        setTimeout(() => {
          resolve('你遇到了一位神秘的老者，他告诉你宝藏箱的密码隐藏在壁画之中...');
        }, 1500);
      }),
      
      searchTemple: () => new Promise(resolve => {
        setTimeout(() => {
          resolve('经过仔细搜索，你在壁画后面找到了一个隐藏的宝箱！');
        }, 1500);
      }),
      
      openTreasureBox: () => new Promise(resolve => {
        setTimeout(() => {
          resolve('恭喜！你成功打开了宝箱，获得了传说中的黄金宝藏！');
        }, 1500);
      })
    };
    
    // 图书馆游戏流程
    async function startLibraryAdventure() {
      const logElement = document.getElementById('treasure-log');
      const btn = document.getElementById('library-btn');
      btn.disabled = true;
      
      try {
        const clue = await TreasureMap.getInitialClue();
        showStep(logElement, clue, 'info');
        
        gameState.library.steps = 1;
        saveGameState();
        
        // 解答谜题
        const riddleSolved = await askRiddleOnce(logElement);
        
        if (riddleSolved) {
          const riddleResult = await TreasureMap.solveRiddle();
          showStep(logElement, riddleResult.message, 'success');
          
          gameState.library.steps = 2;
          saveGameState();
          
          // 解码古籍
          const location = await TreasureMap.decodeAncientScript();
          showStep(logElement, location, 'info');
          
          gameState.library.completed = true;
          gameState.library.steps = 3;
          saveGameState();
          
          showStep(logElement, '图书馆探索完成！现在你可以前往神庙了。', 'success');
        }
      } catch (e) {
        showStep(logElement, '任务失败: ' + e, 'fail');
      }
      
      btn.disabled = false;
    }
    
    // 神庙游戏流程
    async function startTempleAdventure() {
      const logElement = document.getElementById('temple-log');
      const btn = document.getElementById('temple-btn');
      btn.disabled = true;
      
      try {
        // 检查是否已完成图书馆任务
        if (!gameState.library.completed) {
          showStep(logElement, '你需要先完成图书馆的探索才能进入神庙！', 'fail');
          btn.disabled = false;
          return;
        }
        
        const npc = await TreasureMap.meetNPC();
        showStep(logElement, npc, 'info');
        
        gameState.temple.steps = 1;
        saveGameState();
        
        // 搜索神庙
        const box = await TreasureMap.searchTemple();
        showStep(logElement, box, 'info');
        
        gameState.temple.completed = true;
        gameState.temple.steps = 2;
        saveGameState();
        
        showStep(logElement, '神庙探索完成！现在你可以前往宝藏之地了。', 'success');
      } catch (e) {
        showStep(logElement, '任务失败: ' + e, 'fail');
      }
      
      btn.disabled = false;
    }
    
    // 宝藏游戏流程
    async function startTreasureAdventure() {
      const logElement = document.getElementById('treasure-log-final');
      const btn = document.getElementById('treasure-btn');
      btn.disabled = true;
      
      try {
        // 检查是否已完成神庙任务
        if (!gameState.temple.completed) {
          showStep(logElement, '你需要先完成神庙的探索才能寻找宝藏！', 'fail');
          btn.disabled = false;
          return;
        }
        
        const treasure = await TreasureMap.openTreasureBox();
        showStep(logElement, treasure, 'success');
        
        gameState.treasure.completed = true;
        gameState.treasure.steps = 1;
        saveGameState();
        
        showStep(logElement, '恭喜你完成了整个寻宝冒险！', 'success');
      } catch (e) {
        showStep(logElement, '任务失败: ' + e, 'fail');
      }
      
      btn.disabled = false;
    }
    
    // 页面导航
    function showPage(page) {
      mainPage.style.display = 'none';
      libraryPage.style.display = 'none';
      templePage.style.display = 'none';
      treasurePage.style.display = 'none';
      
      page.style.display = 'block';
    }
    
    // 初始化
    function init() {
      loadGameState();
      
      // 主页面按钮事件
      document.querySelectorAll('.explore-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const location = this.parentElement.getAttribute('data-location');
          if (location === 'library') {
            showPage(libraryPage);
          } else if (location === 'temple') {
            showPage(templePage);
          } else if (location === 'treasure') {
            showPage(treasurePage);
          }
        });
      });
      
      // 返回按钮事件
      document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => showPage(mainPage));
      });
      
      // 重置按钮事件
      document.querySelectorAll('.reset-btn, #reset-btn').forEach(btn => {
        btn.addEventListener('click', resetGameState);
      });
      
      // 地点按钮事件
      document.getElementById('library-btn').addEventListener('click', startLibraryAdventure);
      document.getElementById('temple-btn').addEventListener('click', startTempleAdventure);
      document.getElementById('treasure-btn').addEventListener('click', startTreasureAdventure);
      
      // 音频控制
      const audioToggle = document.getElementById('audio-toggle');
      let audioPlaying = false;
      
      audioToggle.addEventListener('click', () => {
        if (audioPlaying) {
          backgroundMusic.pause();
          audioToggle.textContent = '🔇';
        } else {
          backgroundMusic.play().catch(e => console.log('音频播放失败:', e));
          audioToggle.textContent = '🔊';
        }
        audioPlaying = !audioPlaying;
      });
      
      // 初始显示主页面
      showPage(mainPage);
    }
    
    // 页面加载完成后初始化
    window.addEventListener('DOMContentLoaded', init);