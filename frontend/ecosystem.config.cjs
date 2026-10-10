module.exports = {
  apps: [
    {
      name: 'bomberos-frontend',
      script: 'node_modules/serve/build/main.js',
      args: '-s dist -l 5173',
      cwd: 'C:/Bomberos_Voluntarios/frontend'
    }
  ]
};