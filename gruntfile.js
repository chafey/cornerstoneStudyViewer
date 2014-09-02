module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            default: {
                src: [
                    'dist',
                    'docs',
                    'build'
                ]
            }
        },
        copy : {
            src: {
                src: [
                    'src/index.html',
                    'src/studyParser.js',
                    'src/studyViewer.html',
                    'src/thumbnails.js',
                    'src/imageViewer.js',
                    'src/architecture.html',
                    'src/dialogs.js'
                ],
                dest: 'build',
                expand: true,
                flatten: true
            },
            lib: {
                src: [
                    'lib/jquery.hammer-full.js',
                    'lib/bootstrap.min.css'
                ],
                dest: 'build',
                expand: true,
                flatten: true
            },
            fonts: {
                src: [
                    'bower_components/font-awesome/fonts/FontAwesome.otf',
                    'bower_components/font-awesome/fonts/fontawesome-webfont.eot',
                    'bower_components/font-awesome/fonts/fontawesome-webfont.svg',
                    'bower_components/font-awesome/fonts/fontawesome-webfont.ttf',
                    'bower_components/font-awesome/fonts/fontawesome-webfont.woff'
                ],
                dest: 'build/fonts',
                expand: true,
                flatten: true
            },
            css: {
                src: [
                    'bower_components/font-awesome/css/font-awesome.css',
                    'bower_components/font-awesome/css/font-awesome.min.css'
                ],
                dest: 'build/css',
                expand: true,
                flatten: true
            },

            bower: {
                src: [
                    'bower_components/bootstrap/dist/js/bootstrap.min.js',
                    'bower_components/cornerstone/dist/cornerstone.min.css',
                    'bower_components/cornerstone/dist/cornerstone.min.js',
                    'bower_components/cornerstoneTools/dist/cornerstoneTools.min.js',
                    'bower_components/cornerstoneWADOImageLoader/dist/cornerstoneWADOImageLoader.min.js',
                    'bower_components/cornerstoneMath/dist/cornerstoneMath.min.js',
                    'bower_components/dicomParser/dist/dicomParser.min.js',
                    'bower_components/hammerjs/hammer.min.js',
                    'bower_components/jquery/dist/jquery.min.js',
                    'bower_components/jquery/dist/jquery.min.map'
                ],
                dest: 'build',
                expand: true,
                flatten: true
            }
        },
        build: {

        },
        watch: {
            scripts: {
                files: ['src/*'],
                tasks: ['buildDebug']
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('buildDebug', ['copy:src']);
    grunt.registerTask('copylib', ['copy:bower', 'copy:lib', 'copy:fonts', 'copy:css']);
    grunt.registerTask('buildAll', ['clean', 'copylib', 'buildDebug']);
    grunt.registerTask('default', ['buildAll']);
};

// Release process:
//  1) Update version numbers
//  2) do a build (needed to update dist versions with correct build number)
//  3) commit changes
//      git commit -am "Changes...."
//  4) tag the commit
//      git tag -a 0.1.0 -m "Version 0.1.0"
//  5) push to github
//      git push origin master --tags