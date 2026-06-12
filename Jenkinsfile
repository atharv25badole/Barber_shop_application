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

        stage('Docker Login') {
           steps {
               withCredentials([usernamePassword(
               credentialsId: 'dockerhub-creds',
               usernameVariable: 'DOCKER_USER',
               passwordVariable: 'DOCKER_PASS'
           )]) {
             bat 'docker login -u %DOCKER_USER% -p %DOCKER_PASS%'
             }
          }
       }
       
       stage('Tag Images') {
           steps {
               bat 'docker tag queue-backend atharvbadole/queue-backend:latest'
               bat 'docker tag queue-frontend atharvbadole/queue-frontend:latest'
           }
       }

       stage('Push Backend') {
           steps {
               bat 'docker push atharvbadole/queue-backend:latest'
           }
       }

       stage('Push Frontend') {
           steps {
               bat 'docker push atharvbadole/queue-frontend:latest'
           }
       } 
    }
}
