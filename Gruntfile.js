module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        /* CSS */
        sass: {
            options: {
                sourcemap: "none",
                noCache: true
            },
            dist: {
                src: "scss/style.scss",
                dest: "css/style.css"
            }
        },        
        autoprefixer: {
            dist: {
                src: "css/style.css",
                dest: "css/style.css"
            }
        },
        cssmin: {
            dist: {
                src: "css/style.css",
                dest: "css/style.css"
            }
        },

        /* JavaScript */
        concat: {
            game: {
                src: ["js/dodgeit/dodgeit.js", "js/dodgeit/audio.js", "js/dodgeit/leaderboard.js", "js/dodgeit/controls.js", "js/dodgeit/screen.js", "js/dodgeit/gameplay.js"],
                dest: "js/dodgeit.min.js"
            },

            header: {
                src: ["js/dodgeit/header.js", "js/dodgeit.min.js"],
                dest: "js/dodgeit.min.js"
            }
        },

        wrap: {
            dist: {
                src:    "js/dodgeit.min.js",
                dest:   "js/dodgeit.min.js"
            },
            options: {
                wrapper: ["$(function() {\n", "\n});"]
            }
        },

        uglify: {
            dist: {
                src: ["js/dodgeit.min.js"],
                dest: "js/dodgeit.min.js"
            }
        },

        /* Watch */
        watch: {
            dist: {
                files: ["scss/*.scss", "js/dodgeit/*.js"],
                tasks: ["dev"]
            }
        },

        /* Clean */
        clean: {
            dist: [
                "css/style.css",
                "js/dodgeit.min.js"
            ]
        }
    });

    grunt.loadNpmTasks("grunt-autoprefixer");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-sass");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-wrap");

    grunt.registerTask("dev", ["clean", "sass", "autoprefixer", "concat:game", "wrap", "concat:header"]);
    grunt.registerTask("prod", ["clean", "sass", "autoprefixer", "cssmin", "concat:game", "wrap", "concat:header", "uglify"]);
    grunt.registerTask("default", "watch");
};