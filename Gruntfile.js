
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

    grunt.registerTask('default', ['less', 'react', 'watch']);
};
