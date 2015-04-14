package com.acme.servlet;

import java.util.List;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.MethodRule;

import com.acme.entity.PageSourceData;
import com.acme.entity.PageSourceData.TagDistribution;
import com.acme.exception.BadRequestException;
import com.acme.test.CatchAllExceptionsRule;

import static com.acme.test.AssertAndLogJUnit.*;

public class PageSourceTest {
  @Rule
  public MethodRule catchAllExceptions = new CatchAllExceptionsRule();
  
  @BeforeClass
  public static void setUpBeforeClass() {
  }
  
  @AfterClass
  public static void tearDownAfterClass() {
  }
  
  @Test
  public void testPageSource() throws InterruptedException {
    PageSource pageSource = new PageSource();
    
    /* 
     * FIXME: Makes test dependent on access to google site. Should instead be part of
     * integrated tests with html served reliably. Subsequent tests also make assumptions
     * about google html source.
     */
    String url = "http://www.google.com";

    String urlSource = pageSource.getPageSource(url);
    
    assertNotNullAndLog("urlSource not null test", urlSource);
    assertTrueAndLog("urlSource not empty test", urlSource.length() > 0);
    
    expTestInit();
    try {
      String badUrl = "http://www.google.c";      
      pageSource.getPageSource(badUrl);
    } catch (BadRequestException e) {
      expTestOccurred(e);
    }
    expTestAssert("bad url fetch failure check");

    /*
     * Test function per API would be ideal, but optimize on get requests instead
     */
    PageSourceData pageSourceData = pageSource.processPageSource(url, urlSource);
    
    assertNotNullAndLog("pageSourceData not null test", pageSourceData);
    
    assertTrueAndLog("pageSourceData id test", pageSourceData.getId().equalsIgnoreCase(url));
    assertTrueAndLog("google tag distribution length check", 
        pageSourceData.getTagDistribution().size() > 0);
    
  }
  
  @Test
  public void testPageSourceData() {
    PageSource pageSource = new PageSource();    
    String testSource = "<body><html><p></p><p></p><div><span>test source</span></div></html>";

    /* Capture assumption that url is not validated or used*/
    PageSourceData pageSourceData = pageSource.processPageSource("foo", testSource);
    assertNotNullAndLog("pageSourceData not null test", pageSourceData);
    assertTrueAndLog("encoding bloat test", 
        pageSourceData.getSource().length() > testSource.length());
    
    List<TagDistribution> tagDistribution = pageSourceData.getTagDistribution();
    assertEqualsAndLog("tagDistribution length check", 5, tagDistribution.size());
    
    TagDistribution pTagDist = tagDistribution.get(0);
    assertTrueAndLog("p tag dist check", pTagDist.getTag().equalsIgnoreCase("p"));
    assertEqualsAndLog("p tag dist count check", 2, pTagDist.getCount());
  }

}
