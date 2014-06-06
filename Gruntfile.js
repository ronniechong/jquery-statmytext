module.exports = function(grunt){
	
	require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jade: {
		  compile: {
		    options: {
		      pretty:true,
		      data: {
		        debug: false
		      }
		    },
		    files: {
		      "index.html": ["src/jade/index.jade"]
		    }
		  }
		},

		compass: {                  
		    dist: {                   
		      options: {              
		        sassDir: 'src/scss/',
		        cssDir: 'assets/css/',
		        environment: 'production',
		        outputStyle:'expanded',
		        noLineComments:true
		      }
		    }
		 },

        copy: {
		  main: {
		    nonull: true,
		    src: 'src/js/jquery.statmytext.js',
		    dest: 'assets/js/jquery.statmytext.js'
		  },
		},

        uglify: {
		    build: {
		        files: {
		            'assets/js/jquery.statmytext.min.js': ['src/js/jquery.statmytext.js']
		        }
		    }
		},

		watch: {
		    js: {
		        files: ['src/js/jquery.statmytext.js'],
		        tasks: ['buildjs']
		    },
		    css: {
		        files: ['src/scss/**/*.scss'],
		        tasks: ['buildcss']
		    },
		    jade: {
		      files: ['src/jade/**/*.jade'],
		      tasks: ['jade']
		    }
		}
    });

     grunt.registerTask('default', []);
     grunt.registerTask('buildcss',  ['compass']);
     grunt.registerTask('buildjs',  ['copy', 'uglify']);

}