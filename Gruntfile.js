
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

        react: {
            jsx: {
                files: [
                    {expand: true,
                     cwd: 'src',
                     src: ['**/*.jsx'],
                     dest: 'build',
                     ext: '.js'
                    }
                ]
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

            react: {
                files: 'src/*.jsx',
                tasks: ['react']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-react');
    grunt.loadNpmTasks('grunt-browserify');

    grunt.registerTask('default', ['less', 'browserify:dev', 'watch']);
};
