<template>
  <div class="not-found">
    <div class="svg-container">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        fill="none"
      >
        <circle
          cx="32"
          cy="32"
          r="31"
          stroke="#D9534F"
          stroke-width="2"
        />
        <line
          x1="20"
          y1="20"
          x2="44"
          y2="44"
          stroke="#D9534F"
          stroke-width="3"
        />
        <line
          x1="44"
          y1="20"
          x2="20"
          y2="44"
          stroke="#D9534F"
          stroke-width="3"
        />
      </svg>
    </div>
    <h1>404 - Страница не найдена</h1>
    <p>Мы не нашли то, что вы искали. Возможно, вы ввели неверный адрес или страница была удалена.</p>
    <a href="/">Вернуться на главную</a>
  </div>
</template>
<style lang="scss">
    .not-found {
      font-family: Arial, sans-serif;
      background-color: #212121;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #e0e0e0; 
      text-align: center;
    
    h1 {
      font-size: 3rem;
      margin: 1rem 0;
      color: #FF6F61; 
    }
    p {
      font-size: 1.2rem;
      color: #bdbdbd;
    }
    a {
      margin-top: 1rem;
      text-decoration: none;
      color: #64b5f6; 
      font-weight: bold;
      font-size: 1rem;
    }
    a:hover {
      text-decoration: underline;
      color: #90caf9;
    }
    .svg-container {
      margin-bottom: 1.5rem;
    }
    .svg-container svg {
      width: 150px;
      height: auto;
      fill: none;
    }
    .svg-container circle {
      stroke: #FF6F61; 
    }
    .svg-container line {
      stroke: #FF6F61; 
    }
  }
  </style>