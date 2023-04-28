# Image Processing: Frontend

This is the frontend code for the "Image Processing" solution.

This project was created with [Vite](https://vitejs.dev/).

It uses the following technologies:

- [React](https://reactjs.org)
- [Material UI](https://mui.com)
- [@tanstack/react-query](https://github.com/tanstack/query)

## Available Commands

In the project directory, you can run:

### Deployment

#### Pre-requisite: Environment variables

1. Deploy the desired backend by following the instructions in the relevant backend folder. Note the URI that the backend is deployed to.
2. Create a file in this folder (i.e. frontend) called `.env.production`.
3. In this file, add the following with the appropriate value for `<BACKEND_URI>`.

```
VITE_API_SERVER=<BACKEND_URI>
```

#### Option 1. Build and deploy to Google Cloud Run in one step

```
gcloud run deploy image-processing-frontend --source . --region=us-central1 --cpu=2 --memory=8G --timeout=3600 --allow-unauthenticated
```

This packages the frontend into an image using the Dockerfile and saves it in the Google Container Registry. It then deploys the image right away.

#### Option 2. Build a container using Google Cloud Build

```
gcloud builds submit --tag gcr.io/your-project-name/image-processing-frontend
```

This uses the Dockerfile to build the frontend container and save it in the Google Container Registry.

This can then be deployed to Cloud Run using the following command:

```
gcloud run deploy image-processing-frontend --image gcr.io/your-project-name/image-processing-frontend --region=us-central1 --platform=managed --cpu=2 --memory=8G --timeout=3600 --allow-unauthenticated --min-instances=0
```

See [Deploy a Python service to Cloud Run](https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-python-service) for more information.

### Development

#### `npm run dev`

Runs the app in the development mode.\
Open [http://localhost:5173](http://localhost:5173) (or whatever link Vite tells you to) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.
