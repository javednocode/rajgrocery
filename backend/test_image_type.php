<?php
$info = getimagesize('/Users/khushi/Desktop/KAR_PRO/backend/uploads/branding/logo_invoice.jpg');
var_dump($info[2] === IMAGETYPE_JPEG);
var_dump($info['mime']);
