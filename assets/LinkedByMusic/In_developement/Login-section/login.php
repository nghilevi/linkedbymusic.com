<?php /* Login.php */ ?>

<html>
<head>
	<title>LinkedByMusic</title>
	<link rel="stylesheet/less" type="text/css" href="login_styles.less" />
	<meta charset='utf-8'> 
</head>
<body>
<div class="login-wrap site-wrap">
	<header class="logo-header">
		<!-- Title: LbM -logo -->
		<img src="images/logo.png" align="middle" />
	</header>

	<div class="login">
		<article class="align-center">
			<div class="section-bg">
				<section class="login-section">
					<div class="outside-login">
						<div class="fb-login login-button ">
							<p>Login</p>
						</div>
						<div class="twitter-login login-button">
							<p>Login</p>
						</div>
					</div>
					<span class="login-divider">OR</span>
					<div class="login-form">
						<form >
							<input class="username" type="text" value="" placeholder="Username" /><br>
							<input class="password" type="text" value="" placeholder="Password" /><br>
							<input class="lbm-login-button login-button" type="submit" value="Jeesus"/>
						</form>
					</div>
				</section>
				<section class="divider">
					<span>
						<p>Not registered yet?</p>
					</span>
				</section>
				<section class="register-section">
						<a href="<?php //echo register.php ?>">
							<button class="register-button">Register</button>
						</a>
				</section>
			</div>
		</article>
	</div>

	<footer>
		<script type="text/javascript" src="./scripts/jquery.js"></script>
		<script type="text/javascript">
	    less = {
	        env: "development", // or "production"
	        async: false,       // load imports async
	        fileAsync: false,   // load imports async when in a page under 
	                            // a file protocol
	        poll: 1000,         // when in watch mode, time in ms between polls
	        functions: {},      // user functions, keyed by name
	        dumpLineNumbers: "comments", // or "mediaQuery" or "all"
	        relativeUrls: false,// whether to adjust url's to be relative
	                            // if false, url's are already relative to the
	                            // entry less file
	        rootpath: "http://localhost/LbM/login"// a path to add on to the start of every url 
	                            //resource
		    };
		</script>
		<script type="text/javascript" src="./scripts/less.js" ></script>
	</footer>
</div>


</body>
</html>