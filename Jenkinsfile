@Library('platform-jenkins-library') _

node {
  def projectName = "spark-sparkreview"
  def github_branch = "develop"
  def jenkins_github_id = "${env.JENKINS_GITHUB_CREDENTIALS_ID}"

  stage("Checkout") {
    checkout changelog: false, poll: false, scm: [
      $class: 'GitSCM',
      branches: [[
        name: "${github_branch}"
      ]],
      doGenerateSubmoduleConfigurations: false,
      extensions: [[
          $class: 'WipeWorkspace'
        ], [
          $class: 'CleanBeforeCheckout'
      ]],
      submoduleCfg: [],
      userRemoteConfigs: [[
        credentialsId: "${jenkins_github_id}",
        url: "git@github.com:telegraph/${projectName}.git"
      ]]
    ]
  }

  //    def Jenkins_Internal_IP = sh(script: 'aws --region eu-west-1 --profile prod ec2 describe-instances --filters \"Name=tag:Name,Values=*jenkins-master-prod*"  --query "Reservations[*].Instances[*].PrivateIpAddress\"   --output=text', returnStdout: true).trim()

  sh """
    eval \$(aws --profile prod --region eu-west-1 ecr get-login --no-include-email)
    cp ~/.gcloud/tmg-platforms-preprod.json .
    cp ~/.gcloud/tmg-platforms-prod.json .
  """

  stage('Build&Push image') {
    docker.withRegistry('https://eu.gcr.io', 'gcr:tmg-platforms-preprod') {
      sh "git branch"
      sh "cat Dockerfile"
      app = docker.build("eu.gcr.io/tmg-platforms-preprod/spark-sparkreview")
      app.push("latest")
    }

    // docker.withRegistry('https://eu.gcr.io', 'gcr:tmg-platforms-prod') {
    //     app = docker.build("eu.gcr.io/tmg-platforms-prod/spark-dev-test-docker-strapi")
    //     app.push("latest")
    // }
  }

  stage("Preprod Deploy") {
    docker.image('385050320367.dkr.ecr.eu-west-1.amazonaws.com/platforms-deploy-tools:latest').inside('-u root -v /var/run/docker.sock:/var/run/docker.sock') {
      sh """
        gcloud auth activate-service-account --key-file=./tmg-platforms-preprod.json
        gcloud config set project tmg-platforms-preprod
        gcloud beta container clusters get-credentials ipaas-k8s-preprod --region europe-west2 --project tmg-platforms-preprod
        helm upgrade -i --recreate-pods --namespace spark-sparkreview spark-sparkreview-install ./helm/spark-sparkreview/ -f helm/spark-sparkreview/values-preprod.yaml
      """
    }
  }

  // stage("Prod Deploy"){
  //     docker.image('385050320367.dkr.ecr.eu-west-1.amazonaws.com/platforms-deploy-tools:latest').inside('-u root -v /var/run/docker.sock:/var/run/docker.sock') {
  //         sh """
  //             gcloud auth activate-service-account --key-file=./tmg-platforms-prod.json
  //             gcloud config set project tmg-platforms-prod
  //             gcloud beta container clusters get-credentials ipaas-k8s-prod --region europe-west2 --project tmg-platforms-prod
  //             helm upgrade -i --recreate-pods --namespace spark-dev-test-docker-strapi spark-dev-test-docker-strapi-install ./helm/spark-dev-test-docker-strapi/ -f helm/spark-dev-test-docker-strapi/values-prod.yaml
  //           """
  //     }
  // }
}
