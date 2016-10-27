// This component shows the full text for an article, and handles hilighting interactions.

import { Component, Input, ChangeDetectionStrategy, OnDestroy, AfterContentInit } from '@angular/core';
import {DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';
import { Subscription }   from 'rxjs/Subscription';

import { Article } from './article';
import { ArticleService } from './article.service';
import { Datum } from './datum';
import { DatumEditService } from './datum-edit.service';


@Component({
    moduleId: module.id,
    selector: 'article-text',
    templateUrl: 'article-text.component.html',
    styleUrls: ['article-text.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleTextComponent implements OnDestroy, AfterContentInit {

    // Currently selected article
    @Input()
    article: Article;
    
    // This service fires an event whenever a datum is selected.
    // We can't have the selected datum just be an input/property of this class, because it would force the template to re-render and reload the iframe every time the selected datum changed.  So we get around this by putting the selected datum into an asynchronous service.
    datumSelectSubscription: Subscription;  
    
    
    // Text Highlighter object
    textHilighter: any;
    
    
    constructor(
      private articleService: ArticleService,
      private sanitizer: DomSanitizer,
      private datumEditService: DatumEditService,
    ) {
    
        // Call this function when the user selects a datum.
        this.datumSelectSubscription = datumEditService.datumSelectSource$.subscribe(
            datum => {
                console.log('Datum selected!');
                console.log(datum);
                
                // Draw hilights on the article.
                this.hltr().removeHighlights();
                this.hltr().deserializeHighlights(JSON.stringify(datum.Highlight));
        
            });
    
    }
    
    
    // This will be called after Angular renders the template.
    // Once the iframe exists, bind the TextHilighter object to it.
    ngAfterContentInit() {
    
        /*setTimeout( function() {
            let iframe = document.querySelector('iframe#article-frame');
            this.hltr = new TextHighlighter(iframe.contentDocument.body);
        }, 10);*/
    }
    
    
    
    // Return the URL to load in the iframe
    articleUrl(): SafeUrl {
        let url = '';
        
        if (this.article) {
            url  = '/article-text/' + this.article.PMCID + '/' + this.article.PMCID + '.html';
        }
        
        // mark the Url as safe from XSS attacks
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    
    
    // Create the hilighter object if it doesn't already exist, and return it.
    // (This is a weird hack, because for some reason I couldn't get any of the Angular lifecycle hooks
    // to fire after the iframe was rendered.  This will get called when the user selects a datum, by
    // when the iframe should definitely exist.)
    hltr(): any {
        if (this.textHighlighter) {
            return this.textHighlighter;
         }
         else {
            this.textHighlighter = new TextHighlighter(document.querySelector('iframe#article-frame').contentDocument.body);
            return this.textHighlighter;
         }
         
    }
    
    
    // When a datum is selected, show the hilights for the datum
    datumSelect(datum: Datum, myself:any): void {
        
    }


    // This is neccessary to prevent memory leaks.
    ngOnDestroy(): void {
        this.datumSelectSubscription.unsubscribe();
    }


}