package io.routr.headers;

import java.text.ParseException;
import java.util.Iterator;

import javax.sip.header.HeaderFactory;
import javax.sip.InvalidArgumentException;
import javax.sip.PeerUnavailableException;
import javax.sip.SipFactory;
import gov.nist.javax.sip.header.To;

@ProtoMapping(header = To.class, field = "to", repeatable = false, extension = false)
public class ToConverter implements Converter<To, io.routr.message.To> {
  @Override
  public io.routr.message.To fromHeader(To header) {
    var builder = io.routr.message.To.newBuilder();
    var addressConverter = new AddressConverter();
    Iterator<String> i = header.getParameterNames();
    while (i.hasNext()) {
      String key = (String) i.next();
      builder.putParameters(key, header.getParameter(key));
    }
    if (header.getTag() != null)
      builder.setTag(header.getTag());
    return builder.setAddress(addressConverter.fromObject(header.getAddress())).build();
  }

  @Override
  public To fromDTO(io.routr.message.To dto) throws InvalidArgumentException, PeerUnavailableException, ParseException {
    var addressConverter = new AddressConverter();
    HeaderFactory factory = SipFactory.getInstance().createHeaderFactory();
    String tag = dto.getTag().isEmpty() ? null : dto.getTag();
    To to = (To) factory.createToHeader(addressConverter.fromDTO(dto.getAddress()), tag);
    Iterator<String> i = dto.getParametersMap().keySet().iterator();
    while (i.hasNext()) {
      String key = (String) i.next();
      to.setParameter(key, dto.getParametersMap().get(key));
    }
    return to;
  }
}