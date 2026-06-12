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
                bat '"C:\\tools\\gitleaks\\gitleaks.exe" detect --source . -v'
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
        
        stage('Trivy Backend Scan') {
            steps {
                bat '"C:\\tools\\trivy\\trivy.exe" image queue-backend'
            }
        }

        stage('Trivy Frontend Scan') {
            steps {
                bat '"C:\\tools\\trivy\\trivy.exe" image queue-frontend'
            }
        }
    }
}
