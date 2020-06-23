#!/bin/sh

echo "INFO: Running static analysis..."

PROJECT_KEY="react-scheduler-calendar"
url="http://localhost:9005/api/qualitygates/project_status?projectKey=$PROJECT_KEY"

# Execute Sonar Scanner
node_modules/sonar-scanner/bin/sonar-scanner -X -Dproject.settings=./sonar-project.properties -Dsonar.host.url=http://localhost:9005

echo "INFO: Analysis Web Page..."
sleep 2
status=$(curl -sL --header "Content-Type: application/json" $url | python -c "import sys, json; print json.load(sys.stdin)['projectStatus']['status']")

echo "INFO: Analysis Done."
echo "INFO: ------------------------------------------------------------------------"
echo "INFO: STATUS $status"
echo "INFO: ------------------------------------------------------------------------"

if [ "$status" = "OK" ] ; then
    echo "INFO: Static analysis found no problems."
    exit 0
else
    echo 1>&2 "ERROR: Static analysis found violations it could not fix."
    exit 1
fi
