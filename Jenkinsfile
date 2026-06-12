pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Code pulled from GitHub'
            }
        }

        stage('Docker Version') {
            steps {
                bat 'docker --version'
            }
        }

        stage('GitLeaks Scan') {
            steps {
                bat 'gitleaks detect --source . -v'
            }
        }

        stage('Build Backend Image') {
            steps {
                bat 'docker build -t queue-backend ./backend'
            }
        }

        stage('Build Frontend Image') {
            steps {
                bat 'docker build -t queue-frontend ./frontend'
            }
        }
    }
}
