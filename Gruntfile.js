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
        uglify: {
            dist: {
                src: ["js/dodgeit/*.js"],
                dest: "js/dodgeit.min.js"
            }
        },

        concat: {
            dist: {
                src: ["js/dodgeit/*.js"],
                dest: "js/dodgeit.min.js"
            }
        },

        /* Watch */
        watch: {
            dist: {
                files: ["scss/*.scss", "js/dodgeit/*.js"],
                tasks: ["dev", "autoprefixer", "concat"]
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
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-sass");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.registerTask("dev", ["sass", "autoprefixer", "concat"]);
    grunt.registerTask("prod", ["sass", "autoprefixer", "cssmin", "uglify"]);
    grunt.registerTask("default", "watch");
};