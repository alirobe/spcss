# spcss
Project Aim: To mess with SharePoint 2010, 2013, and SharePoint Online CSS files; and creates .scss files with pseudo-classes, for easy branding.

Currently in experimental (not yet POC) phase. 

Looking to develop using real test-driven development.

To try this, take some sharepoint CSS files and place them in test/mock_files

run `node index.js`

the sb-generated.scss file mirrors the server-side theme replacement exposed as comments in the SharePoint css files.

I am being quite careful not to redistribute any source from SharePoint 2013 - you will need to run the generator with your copies of the files. 
