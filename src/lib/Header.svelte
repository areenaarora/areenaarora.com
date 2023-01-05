<body>
<div class="header">
    <a href="#Home" class="Home">Areena Arora</a>
    <div class="header-right">
      <a href="#portfolio">Journalism</a>
      <a href="#about">About</a>
      <a href="#projects">Personal Projects</a>
    </div>
  </div>
</body>
<slot />

<style>

body { 
    margin: 0;
    font-family:sans-serif;
    }
  
  .header {
    overflow: hidden;
    background-color:floralwhite;
    padding: 20px 10px;
  }
  
  .header a {
    float: left;
    color: black;
    text-align: center;
    padding: 12px;
    text-decoration: none;
    font-size: 18px; 
    line-height: 25px;
    border-radius: 4px;
  }
  
  .header a.Home {
    font-size: 25px;
    font-weight: bold;
  }
  
  .header a:hover {
    background-color:gold;
    color: black;
  }
  
  .header a.active {
    background-color: dodgerblue;
    color: white;
  }
  
  .header-right {
    float: right;
  }
  
  @media screen and (max-width: 500px) {
    .header a {
      float: none;
      display: block;
      text-align: left;
    }
    
    .header-right {
      float: none;
    }
  }
  </style>