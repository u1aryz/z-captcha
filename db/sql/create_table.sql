CREATE TABLE zcaptcha.captcha
(
    id         INT AUTO_INCREMENT PRIMARY KEY,
    sitekey    VARCHAR(40) NOT NULL,
    token      VARCHAR(511) NOT NULL,
    created_at DATETIME NOT NULL
)
