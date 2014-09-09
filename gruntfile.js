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
            srchtml: {
                src: [
                    'src/index.html',
                    'src/studyViewer.html'
                ],
                dest: 'build/debug/web',
                expand: true,
                flatten: true
            },
            srcjs: {
                src: [
                    'src/studyParser.js',
                    'src/normalizedStudyParser.js',
                    'src/thumbnails.js',
                    'src/imageViewer.js',
                    'src/dialogs.js'
                ],
                dest: 'build/debug/web/js',
                expand: true,
                flatten: true
            },
            srccss: {
                src: [
                    'src/studyViewer.css'
                ],
                dest: 'build/debug/web/css',
                expand: true,
                flatten: true
            },
            srcimages: {
                src: [
                    'src/Luryw-46px high.png'
                ],
                dest: 'build/debug/web/images',
                expand: true,
                flatten: true
            },

            libfonts: {
                src: [
                    'bower_components/font-awesome/fonts/FontAwesome.otf',
                    'bower_components/font-awesome/fonts/fontawesome-webfont.eot',
                    'bower_components/font-awesome/fonts/fontawesome-webfont.svg',
                    'bower_components/font-awesome/fonts/fontawesome-webfont.ttf',
                    'bower_components/font-awesome/fonts/fontawesome-webfont.woff'
                ],
                dest: 'build/debug/web/fonts',
                expand: true,
                flatten: true
            },
            libcss: {
                src: [
                    'bower_components/cornerstone/dist/cornerstone.min.css',
                    'lib/bootstrap.min.css',
                    'bower_components/font-awesome/css/font-awesome.css',
                    'bower_components/font-awesome/css/font-awesome.min.css'
                ],
                dest: 'build/debug/web/css',
                expand: true,
                flatten: true
            },
            libjs: {
                src: [
                    'lib/jquery.hammer-full.js',
                    'bower_components/bootstrap/dist/js/bootstrap.min.js',
                    'bower_components/cornerstone/dist/cornerstone.min.js',
                    'bower_components/cornerstoneTools/dist/cornerstoneTools.min.js',
                    'bower_components/cornerstoneWADOImageLoader/dist/cornerstoneWADOImageLoader.min.js',
                    'bower_components/cornerstoneMath/dist/cornerstoneMath.min.js',
                    'bower_components/dicomParser/dist/dicomParser.min.js',
                    'bower_components/hammerjs/hammer.min.js',
                    'bower_components/jquery/dist/jquery.min.js',
                    'bower_components/jquery/dist/jquery.min.map'
                ],
                dest: 'build/debug/web/js',
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

    grunt.registerTask('buildDebug', ['copy:srchtml', 'copy:srcjs', 'copy:srccss', "copy:srcimages"]);
    grunt.registerTask('copylib', ['copy:libjs', 'copy:libcss', 'copy:libfonts']);
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