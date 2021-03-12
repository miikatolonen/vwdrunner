//For the jump
let isJumping = false;
let bottom = 0;
let gravity = 0.9;
var jumpSound = new Audio();
jumpSound.src = "https://freesound.org/data/previews/187/187025_2567799-lq.mp3";

export function jump(model, position, currentAction, activeAction) {
  if (isJumping) return;
  //7 For max jump value

  jumpSound.play();
  let upTimerId = setInterval(function () {
    //jump down
    if (bottom > 7) {
      clearInterval(upTimerId);
      let downTimerId = setInterval(function () {
        if (bottom < 0) {
          clearInterval(downTimerId);
          isJumping = false;
        }

        //To avoid negativity, position will change otherwise if negative
        if (bottom < 0) {
          //Set Character to same position where it was before jump
          //model.position.set(position, 0, 0);
          //Stop current jump animation
          currentAction.stop();
          //Start running animation again
          activeAction.play();
          model.position.y = 0;
        } else {
          bottom -= 1.75;
          bottom = bottom * gravity;
          //model.position.set(position, bottom, 0);
          model.position.y = bottom;
        }
      }, 40);
    }
    //jump up
    isJumping = true;
    bottom += 1.75;
    bottom = bottom * gravity;
    //model.position.set(position, bottom, 0);
    model.position.y = bottom;
  }, 40);
}
