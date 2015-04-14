package com.acme.servlet;

import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
import java.io.IOException;

import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.ResponseHandler;
import org.apache.http.impl.client.BasicResponseHandler;

import com.acme.common.ActionResult;
import com.acme.common.HttpMethod;
import com.acme.common.BasicRestAction;
import com.acme.entity.PageSourceData;
import com.acme.exception.BadRequestException;
import com.acme.exception.InternalServerException;

import static com.acme.common.ServletUtil.*;

public class PageSource extends BasicRestAction {
  private static final Logger log = LoggerFactory.getLogger(PageSource.class);
  private static final HttpClient httpclient = new DefaultHttpClient();
  
  private int encodeConsume(String input, StringBuffer output, int from, int to) {
    for (int i = from; i < to; i++) {
      char c = input.charAt(i);
      switch (c) {
      case ' ':
        output.append("&nbsp");
        break;
        
      case '<':
        output.append("&lt");
        break;
        
      case '>':
        output.append("&gt");
        break;
        
      case '&':
        output.append("&amp");
        break;
        
        default:
          output.append(c);
      }
    }
    
    return (to - from);
  }
  
  protected PageSourceData processPageSource(String url, String source) {
    Scanner scanner = new Scanner(source);
    
    Map<String, AtomicInteger> tagDist = new HashMap<String, AtomicInteger>();
    Pattern pattern = Pattern.compile("<(/)?([a-zA-Z]*[1-6]?)[^>]*(>|$)");
     
    String line;
    StringBuffer output = new StringBuffer();
    output.append("<table><tbody>");
    
    while (scanner.hasNextLine()) {
      line = scanner.nextLine();
      output.append("<tr><td class=\"siz-td-break-all\">");
      int cursor = 0;
      Matcher matcher = pattern.matcher(line);

      while (matcher.find()) {
        if (matcher.groupCount() < 2) continue;
        
        String tag = matcher.group(2);
        if (tag == null || tag.isEmpty()) continue;

        boolean endTag = false;        
        String slashGroup = matcher.group(1);
        if (slashGroup != null && slashGroup.equalsIgnoreCase("/")) endTag = true;

        if (!endTag) {
          if (!tagDist.containsKey(tag)) {
            tagDist.put(tag, new AtomicInteger(1));
          } else {
            tagDist.get(tag).incrementAndGet();
          }
        }
        
        cursor += encodeConsume(line, output, cursor, matcher.start(2));
        if (endTag) {
          output.append("<span data-tagtype=\"" + tag + "-endtag\">" + tag + "</span>");          
        } else {
          output.append("<span data-tagtype=\"" + tag + "-tag\">" + tag + "</span>");
        }
        cursor += tag.length();
      }
      
      encodeConsume(line, output, cursor, line.length());
      output.append("</td></tr>");
    }
    
    output.append("</tbody></table>");
    
    log.debug("output\n" + output.toString());

    return new PageSourceData(url, output.toString(), tagDist);
  }
  
  protected String getPageSource(String url) {
    String responseBody;
    try {
      HttpGet httpGet = new HttpGet(url);

      ResponseHandler<String> responseHandler = new BasicResponseHandler();
      responseBody = httpclient.execute(httpGet, responseHandler);
    } catch (ClientProtocolException e) {
      throw new InternalServerException("page source get request failed: ", e);
    } catch (IOException e) {
      throw new BadRequestException("page source get request failed: ", e);
    }

    return responseBody;
  }
  
  public String pageSource() {
    HttpMethod method = getMethod();
    
    switch (method) {
    case POST:
      Map<String, Object> request = getPostContent();
      String url = getRequestParam(request, PageSourceData.MetaParam.URL).toLowerCase();

      String responseBody = getPageSource(url);
      
      return prepInputStream(processPageSource(url, responseBody));
      
    default:
      throw new RuntimeException("method forbidden");
    }
  }
  
  public String jsrequired() {
    return ActionResult.Generic.JSREQ;
  }
  
}
