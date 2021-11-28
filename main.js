const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
var width = window.innerWidth;
var height = window.innerHeight;


function resize() {
  width = window.innerWidth,
  height = window.innerHeight,
  ratio = window.devicePixelRatio;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  context.scale(ratio, ratio);
}
window.onresize = function() {
  resize();
};
window.onload = function() {
  resize();
  window.requestAnimationFrame(animate);
}

document.addEventListener('mousemove', (p) => {
  let t = canvas.getBoundingClientRect();
  mouse = [(p.pageX - t.left), (p.pageY - t.top)];
}, false);

document.onmousedown = function (e) {
  if (e.button == 0) {
    sudoku.click(mouse);
  }
};

document.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  if (e.keyCode == 32) {
    sudoku.think()
  }
}, false);

class Sudoku{
  constructor(){
    this.grid=[];
    for (let i = 0; i < 9; i++) {
      this.grid[i]=[];
      for (let j = 0; j < 9; j++) {
        this.grid[i][j]=new Cell(i,j);
      }
    }
  }
  draw(ctx){
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        this.grid[i][j].draw(ctx);
      }
    }
  }
  from(arr){
    for (var i = 0; i < 9; i++) {
      for (var j = 0; j < 9; j++) {
        this.grid[i][j].value=arr[j][i]
      }
    }
  }
  click(mouse){
    let cellX = Math.floor(((mouse[0]-width/2)/scale)-0.5)+5;
    let cellY = Math.floor(((mouse[1]-height/2)/scale)-0.5)+5;
    if (cellX>=0&&cellX<=8&&cellY>=0&&cellY<=8) {
      this.grid[cellX][cellY].value++;
      this.grid[cellX][cellY].value=this.grid[cellX][cellY].value%10
    }
  }
  think(){
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (this.grid[i][j].value==0) {
          let cols = this.getCol(i,j)
          let rows = this.getRow(i,j)
          let cels = this.getCel(i,j)

          let colsDiff = this.grid[i][j].possibilities.filter(x => !cols[1].includes(x));
          let rowsDiff = this.grid[i][j].possibilities.filter(x => !rows[1].includes(x));
          let celsDiff = this.grid[i][j].possibilities.filter(x => !cels[1].includes(x));
          if (colsDiff.length==1) {
            if (!cols[0].includes(colsDiff[0])) {
              this.grid[i][j].value=colsDiff[0]
            }
          }
          if (rowsDiff.length==1) {
            if (!rows[0].includes(rowsDiff[0])) {
              this.grid[i][j].value=rowsDiff[0]
            }
          }
          if (celsDiff.length==1) {
            if (!cels[0].includes(celsDiff[0])) {
              this.grid[i][j].value=celsDiff[0]
            }
          }
        }
      }
    }
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        let possibilities=[]
        let cols = this.getCol(i,j)
        let rows = this.getRow(i,j)
        let cels = this.getCel(i,j)

        for (let k = 1; k <= 9; k++) {
          if (!(cols[0].includes(k)||rows[0].includes(k)||cels[0].includes(k))) {
            possibilities.push(k)
          }
        }
        this.grid[i][j].possibilities=possibilities
      }
    }
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (this.grid[i][j].possibilities.length==1&&this.grid[i][j].value==0) {
          this.grid[i][j].value=this.grid[i][j].possibilities[0]
        }
      }
    }
  }
  getRow(row,col){
    let nums = []
    let numsP = []
    for (let i = 0; i < 9; i++) {
      if (this.grid[row][i].value!=0) {
        nums.push(this.grid[row][i].value)
      }else {
        if (col!=i) {
          for (var j in this.grid[row][i].possibilities) {
            if (!numsP.includes(this.grid[row][i].possibilities[j])) {
              numsP.push(this.grid[row][i].possibilities[j])
            }
          }
        }
      }
    }
    return [nums,numsP]
  }
  getCol(row,col){
    let nums = []
    let numsP = []
    for (let i = 0; i < 9; i++) {
      if (this.grid[i][col].value!=0) {
        nums.push(this.grid[i][col].value)
      }else {
        if (row!=i) {
          for (var j in this.grid[i][col].possibilities) {
            if (!numsP.includes(this.grid[i][col].possibilities[j])) {
              numsP.push(this.grid[i][col].possibilities[j])
            }
          }
        }
      }
    }
    return [nums,numsP]
  }
  getCel(x,y){
    let nums = []
    let numsP = []
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (this.grid[x-(x%3)+i][y-(y%3)+j].value!=0) {
          nums.push(this.grid[x-(x%3)+i][y-(y%3)+j].value)
        }else {
          if (!(x-(x%3)+i==x&&y-(y%3)+j==y)) {
            for (var k in this.grid[x-(x%3)+i][y-(y%3)+j].possibilities) {
              if (!numsP.includes(this.grid[x-(x%3)+i][y-(y%3)+j].possibilities[k])) {
                numsP.push(this.grid[x-(x%3)+i][y-(y%3)+j].possibilities[k])
              }
            }
          }
        }
      }
    }
    return [nums,numsP]
  }
}

class Cell{
  constructor(x,y){
    this.x=x;
    this.y=y;
    this.value=0;
    this.possibilities=[]
  }
  draw(ctx){
    let posX = width/2+(this.x-4.5)*scale+(Math.floor(this.x/3)-1)*bigGap;
    let posY = height/2+(this.y-4.5)*scale+(Math.floor(this.y/3)-1)*bigGap;
    ctx.fillStyle="white"
    ctx.fillRect(posX+smallGap,posY+smallGap,scale-smallGap*2,scale-smallGap*2);
    if (this.value!=0) {
      ctx.textBaseline = 'middle';
      ctx.textAlign="center";
      ctx.fillStyle="black";
      ctx.font = scale/2+"px Arial";
      ctx.fillText(this.value,posX+scale/2,posY+scale/2);
    }else{
      ctx.textBaseline = 'hanging';
      ctx.textAlign="start";
      ctx.fillStyle="black";
      ctx.font = scale/5+"px Arial";
      ctx.fillText(this.possibilities.join(","),posX+smallGap+2,posY+smallGap+2);
    }
  }
}

let scale = 100;
let smallGap = 1;
let bigGap = 4;

let sudoku = new Sudoku();
sudoku.from([
  [0,0,1,0,0,4,0,0,2],
  [0,5,0,0,0,3,0,1,9],
  [4,7,0,0,0,0,0,0,5],
  [0,0,0,0,8,0,2,0,7],
  [0,0,4,0,9,0,8,0,0],
  [8,0,6,0,3,0,0,0,0],
  [2,0,0,0,0,0,0,6,8],
  [1,8,0,2,0,0,0,4,0],
  [5,0,0,3,0,0,9,0,0]])
let mouse = [0,0];
let space=false;

function animate() {
  context.clearRect(0, 0, width, height);
  context.beginPath();
  context.fillStyle = "black";
  context.rect(0, 0, width, height);
  context.fill();
  context.closePath();
  sudoku.draw(context);
  context.textBaseline = 'middle';
  context.textAlign="center";
  context.fillStyle="white";
  context.font = 20+"px Arial";
  context.fillText("press space for each step",width/2,height-40);
  window.requestAnimationFrame(animate);
}
window.requestAnimationFrame(animate);
