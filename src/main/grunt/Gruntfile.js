module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    o: {
      WA: '../webapp',
      DIST: '../webapp/dist',
      PROD: '../webapp/dist/prod',
      DEBUG: '../webapp/dist/debug',
      CSS: '../webapp/css',
      DEBUG_CSS: '../webapp/dist/debug/css'
    },
    clean: {
      options: {
        // to allow delete of file/dir outside CWD
        force: true
      },
      all: ['<%= o.DIST %>'],
      debug: ['<%= o.DEBUG %>'],
      prod: ['<%= o.PROD %>']
    },

    cssmin: {
      compress: {
        files: {
          '<%= o.PROD %>/css/common.css': ['<%= o.DEBUG %>/css/*']
        }
      }
    },

    /*
     * - Retain relative dir/file locations
     * - Copy resources to dist/debug as a prepare-step for subsequent tools (cssmin)
     * - Copy final resources to dist/prod 
     */
    copy: {
      bb: {
        files: [
          {expand: true, flatten: true, src: ['<%= o.CSS %>/content.css'], dest: '<%= o.DEBUG_CSS %>'},
          {expand: true, flatten: true, src: ['<%= o.CSS %>/main.css'], dest: '<%= o.DEBUG_CSS %>'},
          {expand: true, flatten: true, 
            src: ['<%= o.WA %>/css/bootstrap.css'], 
            dest: '<%= o.WA %>/dist/debug/css'},
          {expand: true, flatten: true, 
            src: ['<%= o.WA %>/img/*'], 
            dest: '<%= o.PROD %>/img'},
          {expand: true, flatten: true, 
            src: ['<%= o.WA %>/user/img/*'], 
            dest: '<%= o.PROD %>/user/img'},
          {expand: true, flatten: true, 
            src: ['<%= o.WA %>/js/*'], 
            dest: '<%= o.PROD %>/js'}
        ]
      }
    },

    jshint: {
      bb: {
        options: {
          jshintrc: './jshint-bb.conf'
        },
        files: {
          src: ['Gruntfile.js', '<%= o.WA %>/app/**/*.js']          
        }
      }
    },    

    requirejs: {
      compile: {
        options: {
          baseUrl: '<%= o.WA %>/app',
          mainConfigFile: '<%= o.WA %>/app/config.js',
          name: 'config',
          out: '<%= o.PROD %>/app.js',
          preserveLicenseComments: false,
          paths: {
            requireLib: '<%= o.WA %>/../assets/js/libs/require'
          },
          include: 'requireLib',
          optimize: 'uglify2'
        }
      }
    }

  });
  
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-uglify');  
  
  grunt.registerTask('commit', ['jshint']);
  grunt.registerTask('default', ['commit']);
  grunt.registerTask('buildbb', ['clean', 'copy:bb', 'cssmin', 'requirejs', 'clean:debug']);
  grunt.registerTask('buildall', ['buildbb']);
  grunt.registerTask('buildprod', ['jshint', 'buildall']);
};
