const argon2 = require('argon2');

argon2.hash("12345", {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64MB
    timeCost: 3,
    parallelism: 1,
    hashLength: 32
})
    .then(e => {
        console.log("Hashed", e);
    })
    .catch(err => {
        console.log(err.message);
    })

argon2.verify(
    "$argon2id$v=19$m=65536,t=3,p=1$HEFUV38FywC+IqyI0O5/fg$DxmmXN+yfLHcLvBuBGo25q+IEQJ1OgJ7g6f/WPWlfoY"
    ,
    "12344"
)
    .then(e => {
        console.log("Verified", e);
    })
    .catch(err => {
        console.log(err.message);
    })