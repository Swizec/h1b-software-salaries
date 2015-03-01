
module.exports = function (grunt) {
    require('jit-grunt')(grunt);

    grunt.initConfig({
        less: {
            development: {
                options: {
                    compress: true,
                    yuicompress: true,
                    optimization: 2
                },
                files: {
                    "build/style.css": "src/style.less"
                }
            }
        },

        browserify: {
            options: {
                transform: ['reactify', 'debowerify']
            },
            dev: {
                options: {
                    debug: true
                },
                src: 'src/main.jsx',
                dest: 'build/bundle.js'
            },
            production: {
                options: {
                    debug: false
                },
                src: '<%= browserify.dev.src %>',
                dest: 'build/bundle.js'
            }
        },

        watch: {
            styles: {
                files: ['src/*.less'],
                tasks: ['less'],
                options: {
                    nospawn: true
                }
            },

            browserify: {
                files: 'src/*.jsx',
                tasks: ['browserify:dev']
            }
        }
    });

    grunt.registerTask('default', ['less', 'browserify:dev', 'watch']);
    grunt.registerTask('package', ['less', 'browserify:production']);
};
