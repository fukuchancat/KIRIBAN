module.exports = function (grunt) {
	//Gruntの設定
	grunt.initConfig({
        pkg: grunt.file.readJSON('package.json')
	});

	grunt.initConfig({
		jade: {
			options: {
				pretty: true,
				data: grunt.file.readJSON('package.json')
			},
			source: {
				expand: true,
				cwd: 'views/jades',
				src: '*.jade',
				dest: 'public',
				ext: '.html'
			}
		},
		stylus: {
			options: {
				compress: false
			},
			source: {
				expand: true,
				cwd: 'views/styluses',
				src: '*.styl',
				dest: 'public/stylesheets',
				ext: '.css'
			}
		}
	});

	//プラグインからタスクを読み込む
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-contrib-stylus');

	//defaultタスクの定義
	grunt.registerTask('default', ['jade', 'stylus']);
};